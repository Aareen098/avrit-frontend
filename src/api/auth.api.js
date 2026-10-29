import api from "@/api/axios";
import { ROLES, normalizeRole } from "@/utils/constants";

// Mock mode is ON unless .env says VITE_USE_MOCK=false.
// When your Spring Boot API is ready: set VITE_USE_MOCK=false and restart `npm run dev`.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- Mock companies and users, kept in the browser ----
// The demo accounts below all belong to this company. Companies created on the sign-up page
// are saved next to it, so you can try the whole flow without a backend.
const DEMO_COMPANY = { id: 1, name: "Acme Technologies", slug: "acme" };
const COMPANIES_KEY = "avrit-mock-companies";
const USERS_KEY = "avrit-mock-users";

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export const getMockCompanies = () => [DEMO_COMPANY, ...readList(COMPANIES_KEY)];

function companyFields(company) {
  return { companyId: company.id, companyName: company.name, companySlug: company.slug };
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "company"
  );
}

function mockRole(email) {
  const e = email.toLowerCase();
  if (e.includes("admin")) return ROLES.ADMIN;
  if (e.includes("manager")) return ROLES.HIRING_MANAGER;
  if (e.includes("candidate")) return ROLES.CANDIDATE;
  return ROLES.RECRUITER;
}

function nameFromEmail(email) {
  const name = email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  return name || "User";
}

// Same shape for login and company sign-up.
function toSession(data) {
  return { token: data.token, user: { ...data.user, role: normalizeRole(data.user.role) } };
}

function errorMessage(err, fallback) {
  return err.response?.data?.message || (err.response ? fallback : "Could not reach the server");
}

// Expected from Spring Boot:
// POST /auth/register  { name, email, password }
//   ->  { token, user: { ..., role: "CANDIDATE" } }
// Creates a candidate account and logs them in.
export async function registerCandidate(form) {
  const name = form.fullName.trim();
  const email = form.email.trim();

  if (USE_MOCK) {
    await wait(600);
    const users = readList(USERS_KEY);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }
    const user = { id: Date.now(), name, email, role: ROLES.CANDIDATE };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    return { token: "mock-token", user };
  }

  try {
    const { data } = await api.post("/auth/register", { name, email, password: form.password });
    return toSession(data);
  } catch (err) {
    throw new Error(errorMessage(err, "Could not create the account"), { cause: err });
  }
}

// Expected from Spring Boot:
// POST /auth/login  { email, password }
//   ->  { token, user: { id, name, email, role, companyId, companyName, companySlug } }
// (candidates have no company, so those three fields are empty for them)
export async function login({ email, password }) {
  if (USE_MOCK) {
    await wait(500);
    if (password === "wrong") throw new Error("Invalid email or password");

    const signedUp = readList(USERS_KEY).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (signedUp) return { token: "mock-token", user: signedUp };

    const role = mockRole(email);
    return {
      token: "mock-token",
      user: {
        id: 1,
        name: nameFromEmail(email),
        email,
        role,
        ...(role === ROLES.CANDIDATE ? {} : companyFields(DEMO_COMPANY)),
      },
    };
  }

  try {
    const { data } = await api.post("/auth/login", { email, password });
    return toSession(data);
  } catch (err) {
    throw new Error(errorMessage(err, "Invalid email or password"), { cause: err });
  }
}

// Expected from Spring Boot:
// POST /auth/register-company
//   { companyName, website, size, industry, jobTitle, name, email, password }
//   ->  { token, user: { ..., role: "ADMIN", companyId, companyName, companySlug } }
// Creates the company and its first Admin, and logs them in.
export async function registerCompany(form) {
  const name = form.fullName.trim();
  const email = form.email.trim();
  const companyName = form.companyName.trim();

  if (USE_MOCK) {
    await wait(600);
    const users = readList(USERS_KEY);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }

    const companies = getMockCompanies();
    const base = slugify(companyName);
    let slug = base;
    for (let n = 2; companies.some((c) => c.slug === slug); n++) slug = `${base}-${n}`;

    const company = { id: Date.now(), name: companyName, slug };
    const user = { id: Date.now() + 1, name, email, role: ROLES.ADMIN, ...companyFields(company) };
    localStorage.setItem(COMPANIES_KEY, JSON.stringify([...readList(COMPANIES_KEY), company]));
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    return { token: "mock-token", user };
  }

  try {
    const { data } = await api.post("/auth/register-company", {
      companyName,
      // The form accepts "acme.com"; the server wants a full link.
      website: /^https?:\/\//i.test(form.website.trim()) ? form.website.trim() : `https://${form.website.trim()}`,
      size: form.size,
      industry: form.industry,
      jobTitle: form.role,
      name,
      email,
      password: form.password,
    });
    return toSession(data);
  } catch (err) {
    throw new Error(errorMessage(err, "Could not create the workspace"), { cause: err });
  }
}

// Real API: POST /auth/forgot-password { email } -> 204 always (never reveals whether the email has an account)
export async function forgotPassword(email) {
  if (USE_MOCK) {
    await wait(600);
    return;
  }
  try {
    await api.post("/auth/forgot-password", { email: email.trim() });
  } catch (err) {
    throw new Error(errorMessage(err, "Could not send the email. Please try again."), { cause: err });
  }
}

// Real API: POST /auth/reset-password { token, password } -> 204, or 400 "invalid or expired".
// Also used by invited teammates to set their first password.
export async function resetPassword({ token, password }) {
  if (USE_MOCK) {
    await wait(600);
    return;
  }
  try {
    await api.post("/auth/reset-password", { token, password });
  } catch (err) {
    throw new Error(errorMessage(err, "Could not set the password. Please try again."), { cause: err });
  }
}

// Real API: POST /auth/google { credential } -> { token, user } (same as login).
// credential is the ID token from Google's button. New emails become candidate accounts.
export async function googleLogin(credential) {
  try {
    const { data } = await api.post("/auth/google", { credential });
    return toSession(data);
  } catch (err) {
    throw new Error(errorMessage(err, "Google sign-in failed. Please try again."), { cause: err });
  }
}

// Real API: POST /auth/verify-email { token } -> 204, or 400 "invalid or expired"
export async function verifyEmail(token) {
  try {
    await api.post("/auth/verify-email", { token });
  } catch (err) {
    throw new Error(errorMessage(err, "Could not verify the email. Please try again."), { cause: err });
  }
}

// Real API: POST /auth/resend-verification { email } -> 204 always
export async function resendVerification(email) {
  if (USE_MOCK) {
    await wait(400);
    return;
  }
  try {
    await api.post("/auth/resend-verification", { email: email.trim() });
  } catch (err) {
    throw new Error(errorMessage(err, "Could not send the email. Please try again."), { cause: err });
  }
}