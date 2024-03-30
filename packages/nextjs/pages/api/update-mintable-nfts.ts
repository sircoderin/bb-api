import { getOwnerNFTContract, setRequest } from "../../utils/contract-helper";
import type { NextApiRequest, NextApiResponse } from "next";

// Create a contract instance
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  setRequest(req, res);

  try {
    await getOwnerNFTContract().updateMintableNFTs(req.body.address, req.body.rating);
    res.status(200).json({ text: "updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating NFT." });
  }
}
