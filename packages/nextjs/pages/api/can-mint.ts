import contract from "../../../hardhat/artifacts/contracts/MyNFT.sol/MyNFT.json";
import dotenv from "dotenv";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

dotenv.config();

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const mintableNFTs = await myNftContract.getMintableNFTs(req.body.address, req.body.rating);
    if (mintableNFTs.length === 0) {
      res.status(400).json({ error: "No NFTs available to mint" });
      return;
    }

    res.status(200).json({ mintableNFTs: mintableNFTs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while minting the NFT." });
  }
}
