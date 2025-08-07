import type { SupportedChainId } from "@ethereum-tag-service/contracts/multiChainConfig";
import { chains } from "@ethereum-tag-service/contracts/multiChainConfig";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host;
  const subdomain = host?.split(".")[0];

  let chainId: SupportedChainId = "421614"; // Default to Arbitrum Sepolia

  if (subdomain === "arbitrumSepolia") {
    chainId = "421614";
  } else if (subdomain === "baseSepolia") {
    chainId = "84532";
  } else if (process.env.NEXT_PUBLIC_ETS_ENVIRONMENT === "localhost") {
    chainId = "31337";
  }

  (req as any).chainId = chainId;
  res.end();
}
