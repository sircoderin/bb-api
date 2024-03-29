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
const contractAddress = "0x919C2bc80E071A3b3012E461f5C0B297c1a9787D";

// Create a contract instance
const myNftContract = new ethers.Contract(contractAddress, abi, signer);

// Call mintNFT function
async function mintNFT(address: string, rating: number, tokenUri: string) {
  const nftTxn = await myNftContract.safeMint(address, tokenUri);
  await nftTxn.wait();
  const txHash = `NFT Minted! Check it out at: https://sepolia.etherscan.io/tx/${nftTxn.hash}`;
  console.log(txHash);

  return txHash;
}

async function uploadNFTMetadata(address: string, rating: number, tokenId: number) {
  let imageHash;
  let badgeType;

  if (rating > 1500) {
    imageHash = BADGE3_HASH;
    badgeType = "Breakeroo";
  } else if (rating > 1000) {
    imageHash = BADGE2_HASH;
    badgeType = "Middlebreaker";
  } else if (rating > 500) {
    imageHash = BADGE1_HASH;
    badgeType = "Breakey";
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
    const body = req.body;
    const ipfsUri = await uploadNFTMetadata(body.address, body.rating, await myNftContract.getNextId());
    const txHash = await mintNFT(body.address, body.rating, ipfsUri);
    res.status(200).json({ transactionHash: txHash });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while minting the NFT." });
  }
}
