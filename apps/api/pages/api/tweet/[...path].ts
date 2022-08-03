// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import axios from "axios";
import pinataSDK from "@pinata/sdk";

type Data = {
  data: JSON;
};


const handleError = () => "failed";

const pinata = pinataSDK(
  process.env.PINATA_API_KEY ?? "No API Key",
  process.env.PINATA_SECRET ?? "No Secret"
);

const getTweetMetadata = async (
  id: string,
): Promise<any> => {

  //make axios call for tweets by id
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { path } = req.query;
  var id = path[0];
  var jsonBuilder: any = {};
  getTweetMetadata(id).then((token) => {
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
