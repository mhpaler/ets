/**
 * Truncates a string to a specified length and appends an ellipsis ('...') to indicate truncation.
 * The location of the ellipsis can be specified as at the start, middle, or end of the truncated string.
 *
 * @param {string | string[] | undefined} str - The string to be truncated. If the input is not a single string,
 * it will return an empty string.
 * @param {number} [maxLength=20] - The maximum length of the truncated string including the ellipsis.
 * If the original string is shorter than or equal to this length, it will be returned unmodified.
 * @param {"start" | "middle" | "end"} [ellipsisLocation="end"] - The location of the ellipsis in the truncated string.
 * Can be 'start' to place the ellipsis at the beginning, 'middle' to place it in the center, or 'end' to place it at the end.
 * The default is 'end'.
 *
 * @returns {string} - The truncated string with an ellipsis indicating where the string was cut.
 * If the input is not a string, an empty string is returned. For the 'middle' location, the function attempts to
 * distribute characters as evenly as possible on both sides of the ellipsis.
 *
 * Examples:
 * Truncate("Hello World", 10, "end") => "Hello W..."
 * Truncate("Hello World", 10, "start") => "...o World"
 * Truncate("Hello World", 10, "middle") => "Hel...rld"
 */
const Truncate = (
  str: string | string[] | undefined,
  maxLength: number = 20,
  ellipsisLocation: "start" | "middle" | "end" = "end",
): string => {
  if (typeof str !== "string") {
    // Input validation: Return an empty string for non-string inputs.
    return "";
  }

  if (str.length <= maxLength) {
    // No truncation needed if the string is within the maxLength.
    return str;
  }

  switch (ellipsisLocation) {
    case "start":
      // Truncate from the start: "... + last part of the string"
      return `...${str.substring(str.length - maxLength + 3)}`;
    case "middle": {
      // Truncate from the middle: "first part...last part"
      const charsToShow = maxLength - 3;
      const frontChars = Math.ceil(charsToShow / 2);
      const backChars = Math.floor(charsToShow / 2);
      return `${str.substring(0, frontChars)}...${str.substring(str.length - backChars)}`;
    }
    case "end":
    default:
      // Truncate from the end: "first part of the string + ..."
      return `${str.substring(0, maxLength - 3)}...`;
  }
};

export { Truncate };
