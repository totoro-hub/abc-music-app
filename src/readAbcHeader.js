export function readAbcHeader(abcString, field) {
  const match = abcString.match(new RegExp(`^${field}:(.*)$`, "m"));
  return match ? match[1].trim() : "";
}
