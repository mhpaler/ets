export const isValidTag = (tag?: string) => {
  if (!tag) return false;

  const regex = /^#[^\s#]{1,31}$/;

  return regex.test(tag);
};
