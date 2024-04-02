import { getOwnerNFTContract, setRequest } from "../../utils/contract-helper";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!setRequest(req, res)) {
    return;
  }

  try {
    const mintableNFTs = await getOwnerNFTContract().getPublicMintableNFTs(req.body.address);
    res.status(200).json({ mintableNFTs: mintableNFTs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while checking NFTs." });
  }
}
