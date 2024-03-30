import contract from "../../hardhat/artifacts/contracts/MyNFT.sol/MyNFT.json";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

export function getOwnerNFTContract(): ethers.Contract {
  // Get Alchemy API Key
  // const API_KEY = process.env.ALCHEMY_API_KEY;

  // Define a provider
  // const provider = new ethers.AlchemyProvider("sepolia", API_KEY);
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
  const signer = new ethers.Wallet(privateKey, provider);

  // Get contract ABI and address
  const abi = contract.abi;
  const contractAddress = process.env.CONTRACT_ADDRESS || "";

  // Create a contract instance
  return new ethers.Contract(contractAddress, abi, signer);
}

export async function getUserNFTContract(): Promise<ethers.Contract> {
  // Check if MetaMask is installed
  console.log("ASD", window.ethereum);
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

const BADGE1_HASH = "QmbJwT5XarQEAwCKDAKBHu9K7CrgiG8fnzMzop4zdpVW2c";
const BADGE2_HASH = "QmXSzrVgiExggyj4pVniPBinkggUCmrRUH25NU74HY9rTL";
const BADGE3_HASH = "QmXuxh2aFA5WB4jbehbaABDx5WXgkHzpAksZiScamSi1Vs";

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
    return;
  }
}
