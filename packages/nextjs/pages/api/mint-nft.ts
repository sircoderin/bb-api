import { getNFTHash, getOwnerNFTContract, setRequest } from "../../utils/contract-helper";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";
import type { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

// Call mintNFT function
async function mintNFT(address: string, tokenUri: string, badgeType: string) {
  const nftTxn = await getOwnerNFTContract().safeMint(address, tokenUri, badgeType);
  await nftTxn.wait();
  return nftTxn.hash;
}

async function uploadNFTMetadata(nft: string, nftId: number) {
  const nft_data = {
    attributes: [
      {
        trait_type: "Badge type",
        value: nft,
      },
    ],
    image: `https://gateway.pinata.cloud/ipfs/${getNFTHash(nft)}`,
    name: `Bubble ${nft} #${nftId}`,
  };

  const JWT = process.env.PINATA_JWT;
  const pinata = new pinataSDK({ pinataJWTKey: JWT });

  const res = await pinata.pinJSONToIPFS(nft_data, getOptions(nftId));
  const ipfsHash = res.IpfsHash;

  console.log("ipfsHash", ipfsHash);
  return ipfsHash;

  function getOptions(tokenId: number) {
    type PinataOptions = {
      cidVersion: 0 | 1 | undefined;
    };

    const options: {
      pinataMetadata: {
        name: string;
      };
      pinataOptions: PinataOptions;
    } = {
      pinataMetadata: {
        name: `BubbleBreaker NFT ${tokenId}`,
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    return options;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!setRequest(req, res)) {
    return;
  }

  try {
    const contract = getOwnerNFTContract();
    const mintableNFTs = await contract.getPublicMintableNFTs(req.body.address);
    if (mintableNFTs.length === 0) {
      res.status(400).json({ error: "No NFTs available to mint" });
      return;
    }

    const body = req.body;
    const txHashes: string[] = [];
    for (const nft of mintableNFTs) {
      const ipfsUri = await uploadNFTMetadata(nft, await contract.getNextId());
      const txHash = await mintNFT(body.address, ipfsUri, nft);
      txHashes.push(txHash);
    }

    const ipfsHashes: string[] = mintableNFTs.map((nft: string) => getNFTHash(nft));
    res.status(200).json({ transactionHashes: txHashes, ipfsHashes: ipfsHashes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while getting NFTs." });
  }
}
