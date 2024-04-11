async function main() {
  // Grab the contract factory 
  const bbbNft = await ethers.getContractFactory("BubbleBreakerBadge");

  // Start deployment, returning a promise that resolves to a contract object
  const deployedBbbNft = await bbbNft.deploy(); // Instance of the contract 

  console.log(deployedBbbNft);
  console.log("Contract deployed to address:", deployedBbbNft.target);
 }
 
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });