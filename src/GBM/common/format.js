export const roleName = (r) =>
  ({
    MAKER: "Branch user · Maker",
    CHECKER: "Branch user · Checker",
    ADMIN: "Administrator",
    OPERATIONS_USER: "Operations user",
    AUDIT_USER: "Audit user",
  })[r] ||
  r ||
  "User";
export const isDgmDesignation = (d) => ["DGM", "GM", "CGM"].includes(d);
export const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
