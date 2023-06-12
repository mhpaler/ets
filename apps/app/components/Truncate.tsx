// Captures 0x + 4 characters, then the last 4 characters.
const ethRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
const otherRegex = /^([a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

const Truncate = (address: string) => {
  let match;
  if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
    match = address.match(ethRegex);
  } else {
    match = address.match(otherRegex);
  }
  if (match) {
    return `${match[1]}…${match[2]}`;
  }
  return address;
};

export { Truncate };
