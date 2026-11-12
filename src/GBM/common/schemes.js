export const schemes = [
  { id: "cbdt", label: "CBDT", fullName: "Direct Taxes" },
  { id: "nps", label: "NPS", fullName: "National Pension System" },
  { id: "ppf", label: "PPF", fullName: "Public Provident Fund" },
  { id: "scss", label: "SCSS", fullName: "Senior Citizens Savings Scheme" },
];

export function schemeById(id) {
  if (!id) return null;
  return schemes.find((scheme) => scheme.id === id) || null;
}
