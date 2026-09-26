export function parseProductOptions(value: unknown): string[] {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").map(v => v.trim()).filter(Boolean).slice(0, 50);
  } catch { return []; }
}
export function serializeProductOptions(value: unknown) {
  const options = parseProductOptions(value);
  return options.length ? JSON.stringify(options) : null;
}
export function parseProductDescriptions(value: string | null | undefined): string[] {
  return [...new Set((value ?? "").split("\n").map(line => line.trim().replace(/^[-*]\s*/, "").trim()).filter(Boolean))];
}
