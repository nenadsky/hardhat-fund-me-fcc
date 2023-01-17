const { deployments, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function() {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")

          beforeEach(async function() {
              const accounts = await ethers.getSigners()
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("contructor", function() {
              it("Set the aggregator address corectly", async function() {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", function() {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("Updated the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of getFunder", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })

          describe("withdraw", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("Withdraw ETH from a signle sender", async () => {
                  // Arrange
                  const startingFundMeBallance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBallance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBallance
                          .add(startingDeployerBallance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Allows us to withdraw with multiple funders", async () => {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBallance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBallance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBallance
                          .add(startingDeployerBallance)
                          .toString(),
                      endingDeployerBalance.add(withdrawGasCost).toString()
                  )
                  // Make a getter for storage variables
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function() {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(
                      fundMeConnectedContract,
                      "FundMe__NotOwner"
                  )
              })
          })

          it("cheaperWithdraw testing", async () => {
              it("Withdraw ETH from a signle sender", async () => {
                  // Arrange
                  const startingFundMeBallance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBallance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBallance
                          .add(startingDeployerBallance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              const accounts = await ethers.getSigners()
              for (let i = 1; i < 6; i++) {
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[i]
                  )
                  await fundMeConnectedContract.fund({ value: sendValue })
              }

              const startingFundMeBallance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const startingDeployerBallance = await fundMe.provider.getBalance(
                  deployer
              )

              // Act
              const transactionResponse = await fundMe.cheaperWithdraw()
              const transactionReceipt = await transactionResponse.wait()
              const { gasUsed, effectiveGasPrice } = transactionReceipt
              const withdrawGasCost = gasUsed.mul(effectiveGasPrice)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const endingDeployerBalance = await fundMe.provider.getBalance(
                  deployer
              )

              // Assert
              assert.equal(endingFundMeBalance, 0)
              assert.equal(
                  startingFundMeBallance
                      .add(startingDeployerBallance)
                      .toString(),
                  endingDeployerBalance.add(withdrawGasCost).toString()
              )
              // Make a getter for storage variables
              await expect(fundMe.getFunder(0)).to.be.reverted

              for (i = 1; i < 6; i++) {
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(
                          accounts[i].address
                      ),
                      0
                  )
              }
          })
      })
