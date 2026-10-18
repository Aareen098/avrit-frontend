export const ROLES = {
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  HIRING_MANAGER: "HIRING_MANAGER",
  CANDIDATE: "CANDIDATE",
};

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER];

export const ROLE_LABELS = {
  ADMIN: "Admin",
  RECRUITER: "Recruiter",
  HIRING_MANAGER: "Hiring Manager",
  CANDIDATE: "Candidate",
};

// Spring Security often sends "ROLE_ADMIN". This turns it into "ADMIN".
export function normalizeRole(role = "") {
  return String(role)
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/[\s-]+/g, "_");
}

// Where each role lands after login.
export function homeFor(role) {
  if (STAFF_ROLES.includes(role)) return "/dashboard";
  if (role === ROLES.CANDIDATE) return "/portal";
  return "/login";
}
