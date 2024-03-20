export const isValidTag = (tag?: string) => {
  if (!tag) {
    return false;
  }
  const hashtagRegex = /^#[A-Za-z0-9]+$/;
  return hashtagRegex.test(tag);
};

export const invalidTagMsg = "Invalid tag format. Tags must start with a # and contain no special characters.";
