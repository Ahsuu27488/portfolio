// Turns a typed business name into the example domain shown in the live preview.
export function domainFor(name: string) {
  const slug = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
  return `${slug || "yourbusiness"}.com`;
}
