const Truncate = (
  str: string | string[] | undefined,
  maxLength: number = 20,
  ellipsisLocation: "start" | "middle" | "end" = "end",
) => {
  // Ensure that the str is a single string
  if (typeof str !== "string") {
    return ""; // or return a default value, or handle arrays as needed
  }

  if (str.length <= maxLength) {
    return str;
  }

  switch (ellipsisLocation) {
    case "start":
      return `${str.substring(0, maxLength - 3)}...`;
    case "middle":
      const mid = Math.floor(maxLength / 2);
      return `${str.substring(0, mid)}...${str.substring(str.length - (maxLength - mid - 3))}`;
    case "end":
    default:
      return `${str.substring(0, maxLength - 3)}...`;
  }
};

export { Truncate };
