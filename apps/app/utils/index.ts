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
  const date = new Date(timestamp * 1000);
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
export const toEth = (value: number, decimals: number) => {
  if (!value) return value;

  if (decimals) {
    let ether = Number(utils.formatEther(BigNumber.from(value)));
    return ether.toFixed(decimals);
  }

  return utils.formatEther(BigNumber.from(value));
};

/**
 * Generates an Etherscan link for a given piece of data, such as a transaction hash or an address.
 * Allows specification of the network and the type of data for link generation.
 *
 * @param {string} data The data to create the link for (e.g., transaction hash or address).
 * @param {string} [network] The Ethereum network name. Defaults to mainnet if not provided.
 * @param {string} [route="tx"] The Etherscan path segment corresponding to the data type (e.g., "tx" for transactions).
 * @returns {string} The full Etherscan URL.
 *
 * * ### Usage Examples:
 *
 * **Example 1: Creating a Link to a Transaction on Mainnet**
 * ```javascript
 * const transactionHash = "0x123abc...";
 * const txLink = makeScannerLink(transactionHash);
 * console.log(txLink); // Outputs: https://polygonscan.io/tx/0x123abc...
 * ```
 *
 * **Example 2: Creating a Link to an Address on the Mumbai Testnet**
 * ```javascript
 * const address = "0x456def...";
 * const addressLink = makeScannerLink(address, "mumbai", "address");
 * console.log(addressLink); // Outputs: https://mumbai.polygonscan.io/address/0x456def...
 * ```
 *
 * **Example 3: Creating a Link to a Token Contract on Mainnet**
 * ```javascript
 * const contractAddress = "0x789ghi...";
 * const contractLink = makeScannerLink(contractAddress, "mainnet", "token");
 * console.log(contractLink); // Outputs: https://polygonscan.io/token/0x789ghi...
 * ```
 */
export const makeScannerLink = (data: string, network?: string, route: string = "tx") =>
  `https://${!network || network === "mainnet" ? "" : `${network}.`}polygonscan.com/${route}/${data}`;

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
