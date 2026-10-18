import { ROLES } from "@/utils/constants";

const { ADMIN, RECRUITER, HIRING_MANAGER } = ROLES;
const ALL_STAFF = [ADMIN, RECRUITER, HIRING_MANAGER];

// Sidebar menu for staff. "roles" decides who sees each item.
export const STAFF_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ALL_STAFF },
  { to: "/jobs", label: "Jobs", icon: "work", roles: ALL_STAFF },
  { to: "/candidates", label: "Candidates", icon: "group", roles: ALL_STAFF },
  { to: "/pipeline", label: "Pipeline", icon: "view_kanban", roles: [ADMIN, RECRUITER] },
  { to: "/interviews", label: "Interviews", icon: "event", roles: ALL_STAFF },
  { to: "/assistant", label: "AI Assistant", icon: "auto_awesome", badge: "New", roles: [ADMIN, RECRUITER] },
  { to: "/settings", label: "Settings", icon: "settings", roles: [ADMIN] },
];

// Top menu for candidates.
export const CANDIDATE_NAV = [
  { to: "/portal", label: "My Applications", end: true },
  { to: "/portal/profile", label: "Profile" },
];
