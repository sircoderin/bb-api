async function main() {
    // Grab the contract
    const contractDefinition = await ethers.getContractFactory("BubbleBreakerBadge");
 
    // Start deployment, returning a promise that resolves to a contract object
    const deployedContract = await contractDefinition.deploy(); // Instance of the contract 

    console.log(deployedContract, "Contract deployed to address:", deployedContract.target);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });