import { Contract } from 'ethers';
import { config, ethers, run } from 'hardhat';
import fs from 'fs';

async function main() {
//     const libraryFactory = await ethers.getContractFactory(
//         "BokkyPooBahsRedBlackTreeLibrary"
//       );
//     const library = await libraryFactory.deploy();

//     const CappedSetDeploy =
//     await ethers.getContractFactory("CappedSet", {
//       libraries: {
//         BokkyPooBahsRedBlackTreeLibrary: library.address,
//       },
//     });
//   const cappedSet = await CappedSetDeploy.deploy(1000);
//     console.log(cappedSet.address);
    
    await run("verify:verify", {
    address: "0x0C8d9bdf7749716bC0d44de0029759EF7c0772fd",
    constructorArguments: [1000],
    });
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
