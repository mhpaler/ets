export function getTargetType(uri: string): string {
  const parts = uri.split(":");

  if (parts.length > 0) {
    if (parts[0] === "blink") {
      return "BLINK";
    }
    if (parts[0] === "https" || parts[0] === "http") {
      return "URL";
    }
    return "UNKNOWN";
  }

  return "UNKNOWN";
}
