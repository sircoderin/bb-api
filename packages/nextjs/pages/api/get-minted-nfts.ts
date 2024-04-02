import { getNFTHash, getOwnerNFTContract, setRequest } from "../../utils/contract-helper";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!setRequest(req, res)) {
    return;
  }

  try {
    const ipfsHashesMap = new Map();
    await Promise.all(
      req.body.addresses.map(async (address: string) => {
        const mintedNFTs = await getOwnerNFTContract().getMintedNFTs(address);
        ipfsHashesMap.set(
          address,
          mintedNFTs.map((nft: string) => getNFTHash(nft)),
        );
      }),
    );

    res.status(200).json(Object.fromEntries(ipfsHashesMap));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while minting the NFT." });
  }
}
