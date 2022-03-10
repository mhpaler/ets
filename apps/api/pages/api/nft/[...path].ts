// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import axios from "axios";
import pinataSDK from "@pinata/sdk";

type Data = {
  data: JSON;
};

const ETH_ENDPOINT = "https://cloudflare-eth.com";
const POLY_ENDPOINT = "https://polygon-mainnet.g.alchemy.com/v2/JiSFPKQ2VatFtjl4hS--gjtXGlVGI7EE";

const handleError = () => "failed";

const pinata = pinataSDK(
  process.env.PINATA_API_KEY ?? "No API Key",
  process.env.PINATA_SECRET ?? "No Secret"
);

function chainHandler(chain: string): string {
  let chainVal = parseInt(chain);
  if(chainVal == 1) {
    return ETH_ENDPOINT;
  }else if(chainVal == 4){
    console.log("checking Polygon");
    return POLY_ENDPOINT;
  }else{
    return "chain not available";
  }
}

const getTokenMetadata = async (
  address: string,
  tokenID: string,
  chain: string,
): Promise<any> => {
  const abi = ["function tokenURI(uint256 _tokenId) view returns (string URI)"];
  const { JsonRpcProvider } = ethers.providers;
  const provider = new JsonRpcProvider(chainHandler(chain));
  const contract = new ethers.Contract(address, abi, provider);

  const token = await Promise.all([
    contract.tokenURI(tokenID).catch(handleError),
  ]);
  return token;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { path } = req.query;
  var contract = path[0];
  var tokenID = path[1];
  var chain = path[2];
  var jsonBuilder: any = {};
  getTokenMetadata(contract, tokenID, chain).then((token) => {
    if (token[0] === "failed") {
      jsonBuilder.IpfsHash = "not found";
      res.status(200).json({ data: jsonBuilder });
    } else {
      console.log(token[0]);
      let uri = token[0].toString();
      if (uri.substring(0, 4) === "ipfs") {
        uri = `https://gateway.pinata.cloud/${uri.substring(6)}`;
      }
      axios
        .get(uri)
        .then((response) => {
          console.log(response.data);
          pinata
            .pinJSONToIPFS(response.data)
            .then((response2) => {
              jsonBuilder.IpfsHash = response2.IpfsHash;
              jsonBuilder.PinSize = response2.PinSize;
              jsonBuilder.TimeStamp = response2.Timestamp;
              res.status(200).json({ data: jsonBuilder });
            })
            .catch((error) => {
              console.log(error);
              res.status(200).json({ data: error });
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(200).json({ data: error });
        });
    }
  });
}
