export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// "₹2,999"
export const formatInr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// 1250000 -> "1.3M"
export const formatCount = (n) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

// 5242880 -> "5 MB"
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = -1;
  do {
    value /= 1024;
    i++;
  } while (value >= 1024 && i < units.length - 1);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}
