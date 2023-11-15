import { utils, BigNumber } from "ethers";

export const timestampToString = (timestamp: number, language = "en-US") => {
  const date = new Date(timestamp * 1000);
  const formatted = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

  return formatted;
};

export const shorter = (str: string) =>
  str?.length > 8 ? str.slice(0, 6) + "..." + str.slice(-4) : str;

export const toDp = (value: string) =>
  !value ? value : parseFloat(value).toFixed(4);

export const toEth = (value: number, decimals: number) => {
  if (!value) return value;

  if (decimals) {
    let ether = Number(utils.formatEther(BigNumber.from(value)));
    return ether.toFixed(decimals);
  }

  return utils.formatEther(BigNumber.from(value));
};

export const makeEtherscanLink = (
  data: string,
  network?: string,
  route: string = "tx"
) =>
  `https://${
    !network || network === "mainnet" ? "" : `${network}.`
  }etherscan.io/${route}/${data}`;
