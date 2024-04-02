import contract from "../../hardhat/artifacts/contracts/MyNFT.sol/MyNFT.json";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export function getOwnerNFTContract(): ethers.Contract {
  // Get Alchemy API Key
  // const API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  // Define a provider
  // const provider = new ethers.AlchemyProvider("sepolia", API_KEY);
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const privateKey = process.env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY || "";
  const signer = new ethers.Wallet(privateKey, provider);

  // Get contract ABI and address
  const abi = contract.abi;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

  // Create a contract instance
  return new ethers.Contract(contractAddress, abi, signer);
}

export async function getUserNFTContract(): Promise<ethers.Contract> {
  // Check if MetaMask is installed
  if (typeof window.ethereum !== "undefined") {
    try {
      // Create a provider connected to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Create a signer from the user's account
      const signer = await provider.getSigner();

      // Get contract ABI and address
      const abi = contract.abi;
      const contractAddress = process.env.CONTRACT_ADDRESS || "";

      // Create a contract instance with the signer
      return new ethers.Contract(contractAddress, abi, signer);
    } catch (error) {
      console.error("User denied account access", error);
      throw new Error("User denied account access");
    }
  } else {
    throw new Error("MetaMask is not installed");
  }
}

const BADGE1_HASH = "QmTSzj7bBsoXJ4TAARSL5PoW1orp4oBWBTwLKGxzKnGiZ4";
const BADGE2_HASH = "QmQyrxVTrfMi8ztRiLhpTmcNhchmUDXZbsjnxz6RUcftyV";
const BADGE3_HASH = "QmbLFJJDFBj4pKF4jiSKgCueYmTNKkMkbNcXZLvK2KAFEA";

export function getNFTHash(nft: string) {
  let imageHash;
  if (nft === "Breakeroo") {
    imageHash = BADGE3_HASH;
  } else if (nft === "Middlebreaker") {
    imageHash = BADGE2_HASH;
  } else if (nft === "Breakey") {
    imageHash = BADGE1_HASH;
  }

  return imageHash;
}

export function setRequest(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    // Respond to OPTIONS request
    res.status(200).end();
    return false;
  }

  return true;
}
