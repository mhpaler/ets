import { utils, BigNumber } from "ethers";

/**
 * Formats a Wei amount to Ether with a specified number of decimal places.
 * @param amount The amount in Wei as a bigint.
 * @param decimals Optional number of decimal places for the output.
 * @returns The formatted string in Ether with the specified number of decimals.
 */
export const formatEtherWithDecimals = (amount: bigint, decimals?: number): string => {
  const etherString = utils.formatEther(amount.toString());
  if (decimals !== undefined) {
    return parseFloat(etherString).toFixed(decimals);
  }
  return etherString;
};

/**
 * Converts a Unix timestamp to a human-readable date string using the specified language locale.
 *
 * @param {number} timestamp The Unix timestamp in seconds.
 * @param {string} [language="en-US"] The locale identifier to format the date.
 * @returns {string} Formatted date string.
 */
export const timestampToString = (timestamp: number, language = "en-US") => {
  console.log("Timestamp:", timestamp); // Debug log to check the input value

  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) {
    return "Invalid date"; // Handle invalid dates
  }

  const formatted = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return formatted;
};

/**
 * Truncates a string to a shorter version by keeping the beginning and the end,
 * and inserting ellipses in the middle. If the string is shorter than 8 characters,
 * it returns the original string.
 *
 * @param {string} str The string to truncate.
 * @returns {string} The truncated string or the original string if it's shorter than 8 characters.
 */
export const shorter = (str: string) => (str?.length > 8 ? str.slice(0, 6) + "..." + str.slice(-4) : str);

/**
 * Formats a string representing a number to a fixed number of decimal places (4 by default).
 *
 * @param {string} value The string representing a number to format.
 * @returns {string} The number formatted to 4 decimal places as a string.
 */
export const toDp = (value: string) => (!value ? value : parseFloat(value).toFixed(4));

/**
 * Converts a numeric value from wei to ether, allowing for an optional specification of decimal places.
 *
 * @param {number} value The numeric value in wei.
 * @param {number} decimals The number of decimal places for the returned ether value.
 * @returns {string} The value in ether, formatted as a string with the specified number of decimals.
 */
export const toEth = (value: number | undefined, decimals: number, ticker: boolean = false) => {
  if (value === undefined) return ""; // Return an empty string or any other placeholder if value is undefined
  let ether = Number(utils.formatEther(BigNumber.from(value)));
  return decimals ? ether.toFixed(decimals) : utils.formatEther(BigNumber.from(value));
};

/**
 * Generates a URL for viewing details of blockchain entities like transactions, addresses, or tokens
 * on a blockchain explorer website. The function takes an entity identifier (such as a transaction hash
 * or address) and constructs a URL based on the provided base URL of the blockchain explorer.
 *
 * @param {string} data The unique identifier for the blockchain entity (e.g., transaction hash, address).
 * @param {string} [baseUrl] The base URL of the blockchain explorer without the protocol (e.g., "etherscan.io").
 * @param {string} [route="tx"] The route segment in the explorer URL to specify the type of entity (e.g., "tx" for transactions, "address" for wallet addresses).
 * @returns {string} A fully qualified URL to the blockchain explorer page for the given data. Returns a placeholder hash link if the base URL is undefined.
 *
 * ### Usage Examples:
 *
 * **Example 1: Creating a Link to a Transaction on Mainnet**
 * ```typescript
 * const transactionHash = "0x123abc...";
 * const txLink = makeScannerLink(transactionHash, "etherscan.io");
 * console.log(txLink); // Outputs: https://etherscan.io/tx/0x123abc...
 * ```
 *
 * **Example 2: Creating a Link to an Address on the Mumbai Testnet**
 * ```typescript
 * const address = "0x456def...";
 * const addressLink = makeScannerLink(address, "mumbai.polygonscan.com", "address");
 * console.log(addressLink); // Outputs: https://mumbai.polygonscan.com/address/0x456def...
 * ```
 *
 * **Example 3: Creating a Link to a Token Contract on Mainnet**
 * ```typescript
 * const contractAddress = "0x789ghi...";
 * const contractLink = makeScannerLink(contractAddress, "polygonscan.com", "token");
 * console.log(contractLink); // Outputs: https://polygonscan.com/token/0x789ghi...
 * ```
 */
export const makeScannerLink = (data: string, baseUrl?: string, route: string = "tx") => {
  if (!baseUrl) {
    return "#"; // or some default/fallback URL
  }
  return `${baseUrl}/${route}/${data}`;
};

/**
 * A JSON.stringify replacer function that converts BigInt values to strings.
 * This function is useful for serializing objects that may contain BigInt values,
 * since JSON.stringify does not natively support BigInt.
 *
 * @param {string} key The key of the property being stringified.
 * @param {any} value The value of the property being stringified.
 * @returns {any} The value to be used in the JSON stringification: BigInt values are returned as strings, other values are unchanged.
 */
export const bigIntReplacer = (key: any, value: any) => (typeof value === "bigint" ? value.toString() : value);
