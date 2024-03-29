import { getNFTContract, getNFTHash } from "../../utils/contract-helper";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mintedNFTsMap = new Map();
    await Promise.all(
      req.body.addresses.map(async (address: string) => {
        const mintedNFTs = await getNFTContract().getMintedNFTs(address);
        mintedNFTsMap.set(
          address,
          mintedNFTs.map((nft: string) => getNFTHash(nft)),
        );
      }),
    );

    res.status(200).json(Object.fromEntries(mintedNFTsMap));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while minting the NFT." });
  }
}
