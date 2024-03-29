import { getNFTContract } from "../../utils/contract-helper";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mintableNFTs = await getNFTContract().getPublicMintableNFTs(req.body.address);
    if (mintableNFTs.length === 0) {
      res.status(400).json({ error: "No NFTs available to mint" });
      return;
    }

    res.status(200).json({ mintableNFTs: mintableNFTs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while checking NFTs." });
  }
}
