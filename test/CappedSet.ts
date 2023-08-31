import { expect } from "chai";
import { ethers } from "hardhat";
import { randomAddress } from "./utils";

const MAX_LENGTH_ELEMENT = 1000;

function randomInt(): number {
  return Math.floor(Math.random() * (10000000000 - 1 + 1) + 1);
}

describe("CappedSet contract testing", function () {
  async function prepareDeployContract(maximumElement: number): Promise<any> {
    const n: number = maximumElement ? maximumElement : MAX_LENGTH_ELEMENT;
    const libraryFactory = await ethers.getContractFactory(
      "BokkyPooBahsRedBlackTreeLibrary"
    );
    const library = await libraryFactory.deploy();

    const CappedSetDeploy =
      await ethers.getContractFactory("CappedSet", {
        libraries: {
          BokkyPooBahsRedBlackTreeLibrary: library.address,
        },
      });
    const cappedSet = await CappedSetDeploy.deploy(n);
    return cappedSet;
  }

  describe("Insert", function () {
    it("Insert should emit lowest value when not over capacity", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const newAddr = randomAddress();
      await cappedContract.insert(newAddr, 1);
      await expect(cappedContract.insert(newAddr, 1))
        .to.be.revertedWith("Can not add existed address");
    });

    it("Insert should emit lowest value when not over capacity", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const arr = [];
      for (let i = 0; i < 30; i++) {
        const address: string = randomAddress();
        const value: number = randomInt();
        arr.push({
          address,
          value,
        });

        arr.sort((a, b) => a.value - b.value);
        if (i > 0) {
          await expect(cappedContract.insert(address, value))
            .to.be.emit(cappedContract, "LowestItem")
            .withArgs(arr[0].address, arr[0].value);
        } else {
          await expect(cappedContract.insert(address, value))
            .to.be.emit(cappedContract, "LowestItem")
            .withArgs(ethers.constants.AddressZero, 0);
        }
      }
    });
    it("Insert should emit lowest value and boot out lowest value", async function () {
      const cappedContract = await prepareDeployContract(2);
      const arr = [
        {
          address: randomAddress(),
          value: 1,
        },
        {
          address: randomAddress(),
          value: 2,
        },
        {
          address: randomAddress(),
          value: 3,
        },
        {
          address: randomAddress(),
          value: 4,
        }
      ];
      // First time
      await expect(cappedContract.insert(arr[0].address, arr[0].value))
        .to.be.emit(cappedContract, "LowestItem")
        .withArgs(ethers.constants.AddressZero, 0);
      // Second time
      await expect(cappedContract.insert(arr[1].address, arr[1].value))
        .to.be.emit(cappedContract, "LowestItem")
        .withArgs(arr[0].address, arr[0].value);
      // Third time, insert arr[2] and emit arr[1] as expect after arr[0] boot out
      await expect(cappedContract.insert(arr[2].address, arr[2].value))
        .to.be.emit(cappedContract, "LowestItem")
        .withArgs(arr[1].address, arr[1].value);
      // Booted out arr[0]
      await expect(cappedContract.getValueByAddress(arr[0].address))
        .to.be.revertedWith("Can not query non-existed address");
      // Fouth time, insert arr[3] and emit arr[2] as expect after arr[1] boot out
      await expect(cappedContract.insert(arr[3].address, arr[3].value))
        .to.be.emit(cappedContract, "LowestItem")
        .withArgs(arr[2].address, arr[2].value);
    });
  });

  describe("Update", function () {
    it("Could not update non exist address", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const newAddr = randomAddress();
      await expect(cappedContract.update(newAddr, 1))
        .to.be.revertedWith("Can not update non-existed address");
    });

    it("Able to update value of address", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const newAddr = randomAddress();
      await cappedContract.insert(newAddr, 1);
      await cappedContract.update(newAddr, 2);
      const newValue = await cappedContract.getValueByAddress(newAddr);
      await expect(newValue == 2, "New value should be updated");
    });

    it("Able to update address when min value change", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const newAddr1 = randomAddress();
      const newAddr2 = randomAddress();
      await cappedContract.insert(newAddr1, 4);
      await cappedContract.insert(newAddr2, 5);
      
      await expect(cappedContract.update(newAddr2, 3))
      .to.be.emit(cappedContract, "LowestItem")
      .withArgs(newAddr2, 3);

      // If we update current lowest value
      await expect(cappedContract.update(newAddr2, 5))
      .to.be.emit(cappedContract, "LowestItem")
      .withArgs(newAddr1, 4);
      
      await expect(cappedContract.update(newAddr1, 2))
      .to.be.emit(cappedContract, "LowestItem")
      .withArgs(newAddr1, 2);
    });
  });

  describe("Remove", function () {
    it("Able to remove address", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const newAddr = randomAddress();
      await cappedContract.insert(newAddr, randomInt());
      await cappedContract.remove(newAddr);
      await expect(cappedContract.getValueByAddress(newAddr))
        .to.be.revertedWith("Can not query non-existed address");
    });

    it("Unable to remove non existed address", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const newAddr = randomAddress();
      await expect(cappedContract.remove(newAddr))
        .to.be.revertedWith("Can not remove non-existed address");
    });
    
    it("Able to update new address with lowest value", async function () {
      const cappedContract = await prepareDeployContract(MAX_LENGTH_ELEMENT);
      const newAddr1 = randomAddress();
      const newAddr2 = randomAddress();
      const newAddr3 = randomAddress();
      await cappedContract.insert(newAddr1, 4);
      await cappedContract.insert(newAddr2, 5);
      await cappedContract.insert(newAddr3, 6);

      await expect(cappedContract.remove(newAddr2))
        .to.be.emit(cappedContract, "LowestItem")
        .withArgs(newAddr1, 4);
      
      await expect(cappedContract.remove(newAddr1))
        .to.be.emit(cappedContract, "LowestItem")
        .withArgs(newAddr3, 6);
    });
  });
});
