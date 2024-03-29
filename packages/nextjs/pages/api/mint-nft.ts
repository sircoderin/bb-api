import contract from "../../../hardhat/artifacts/contracts/MyNFT.sol/MyNFT.json";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

const BADGE1_HASH = "QmbJwT5XarQEAwCKDAKBHu9K7CrgiG8fnzMzop4zdpVW2c";
const BADGE2_HASH = "QmXSzrVgiExggyj4pVniPBinkggUCmrRUH25NU74HY9rTL";
const BADGE3_HASH = "QmXuxh2aFA5WB4jbehbaABDx5WXgkHzpAksZiScamSi1Vs";

// Get Alchemy API Key
const API_KEY = process.env.ALCHEMY_API_KEY;

// Define an Alchemy Provider
const provider = new ethers.AlchemyProvider("sepolia", API_KEY);

const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
const signer = new ethers.Wallet(privateKey, provider);

// Get contract ABI and address
const abi = contract.abi;
const contractAddress = "0x073e94792D394ceA7cAc4a1847CC4F3C66f60122";

// Create a contract instance
const myNftContract = new ethers.Contract(contractAddress, abi, signer);

// Call mintNFT function
async function mintNFT(address: string, tokenUri: string, badgeType: string) {
  const nftTxn = await myNftContract.safeMint(address, tokenUri, badgeType);
  await nftTxn.wait();
  const txHash = `NFT Minted! Check it out at: https://sepolia.etherscan.io/tx/${nftTxn.hash}`;
  console.log(txHash);

  return txHash;
}

async function uploadNFTMetadata(address: string, badgeType: string, tokenId: number) {
  let imageHash;

  if (badgeType === "Breakeroo") {
    imageHash = BADGE3_HASH;
  } else if (badgeType === "Middlebreaker") {
    imageHash = BADGE2_HASH;
  } else if (badgeType === "Breakey") {
    imageHash = BADGE1_HASH;
  }

  const metadata = {
    attributes: [
      {
        trait_type: "Badge type",
        value: badgeType,
      },
    ],
    image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
    name: `Bubble ${badgeType} #${tokenId}`,
  };

  const JWT = process.env.PINATA_JWT;
  const pinata = new pinataSDK({ pinataJWTKey: JWT });

  const res = await pinata.pinJSONToIPFS(metadata, getOptions(tokenId));
  return res.IpfsHash;
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mintableNFTs = await myNftContract.getMintableNFTs(req.body.address, req.body.rating);
    if (mintableNFTs.length === 0) {
      res.status(400).json({ error: "No NFTs available to mint" });
      return;
    }

    const body = req.body;
    const txHashes: string[] = [];
    for (const badgeType of mintableNFTs) {
      const ipfsUri = await uploadNFTMetadata(body.address, badgeType, await myNftContract.getNextId());
      console.log("ipfsUri", ipfsUri);

      const txHash = await mintNFT(body.address, ipfsUri, badgeType);
      txHashes.push(txHash);
    }

    res.status(200).json({ transactionHashes: txHashes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while minting the NFT." });
  }
}
