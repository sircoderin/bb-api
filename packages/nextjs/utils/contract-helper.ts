import contract from "../../hardhat/artifacts/contracts/MyNFT.sol/MyNFT.json";
import { ethers } from "ethers";

export function getNFTContract(): ethers.Contract {
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
