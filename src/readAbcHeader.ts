export function readAbcHeader(abcString: string, field: string): string {
  const match = abcString.match(new RegExp(`^${field}:(.*)$`, "m"));
  return match ? match[1].trim() : "";
}
