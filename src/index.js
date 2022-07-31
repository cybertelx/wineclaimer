// Get secrets
require("dotenv").config();

// Edit this if you want.
const settings = {
  // Grab the private key from environment variables.
  // (The .env file)
  privateKey: process.env.PRIVATEKEY,

  // VINTAGE threshold: If storage goes above this number,
  // claim and sell for a token of your choice.
  threshold: 500,

  // The token to buy with your VINTAGE
  // Supported: MIM, GRAPE, AVAX
  // Change this to false if
  // you want to hodl VINTAGE.
  token: "MIM",
  // token: false,
};

/*
    copyright (c) operator/cybertelx 2022
    with love and also because fuck i woke up and then
    i saw the vintage was all full and i lost out on
    a bunch of yield yeah alright ill stop rambling


    licensed under the GNU General Public License 3.0

    what that basically means is that:
        - you can use it for whatever
        - you're allowed to sell copies
        - you can use it for commercial purposes
        - you can modify the code (make sure to document
        your changes, so like put a comment at the end
        saying "oh yeah i added X feature")
        - you can help out and contribute
        - you can share with your friends

    BUT you have to share the source code when sharing
    that is a MUST. every person who has this program
    must have the source code. must must must. yes yes.

    AND i am in NO WAY RESPONSIBLE FOR ANYTHING THAT
    HAPPENS WITH THIS. NOR DOES THIS SOFTWARE HAVE ANY
    WARRANTY. NONE AT ALL.

    you also have to credit me, otherwise you're a dick.
    keep this notice in here please <3

    (see the below for more info)
    https://choosealicense.com/licenses/gpl-3.0/
*/

// End users: Don't mess with the following lines of
// code unless you have basic knowledge of Ethers.js
// and JavaScript.

const { ethers } = require("ethers");
const { vintageAbi, wineryAbi, routerAbi } = require("./abi");

// connect to provider
const provider = new ethers.providers.StaticJsonRpcProvider(
  "https://api.avax.network/ext/bc/C/rpc"
);

const wallet = new ethers.Wallet(settings.privateKey, provider);

const vintage = new ethers.Contract(
  "0x01Af64EF39AEB5612202AA07B3A3829f20c395fd",
  vintageAbi,
  wallet
);
const winery = new ethers.Contract(
  "0xaE1DE1c258c5587CFEA69045992a5467cFF4406F",
  wineryAbi,
  wallet
);

const router = new ethers.Contract(
  "0xc7f372c62238f6a5b79136a9e5d16a2fd7a3f0f5",
  routerAbi,
  wallet
);
const MIM = "0x130966628846BFd36ff31a822705796e8cb8C18D";
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const GRAPE = "0x5541D83EFaD1f281571B343977648B75d95cdAC2";

async function init() {
  console.log("yeehaw");
  await checkAndClaim();
  // scanning every 5 minutes should be good
  setInterval(checkAndClaim, 5 * 60 * 1000);
}

async function checkAndClaim() {
  const address = wallet.address;
  const vintageAmount = await winery.getVintageWineAccrued(address);

  // turn that vintageAmount into a number
  const vintageAmountNumber = Number(ethers.utils.formatEther(vintageAmount));

  console.log("Current vintage amount: " + vintageAmountNumber);
  if (vintageAmountNumber >= settings.threshold) {
    console.log("Will claim " + vintageAmountNumber);
    // claim it
    let tx = await winery.claimVintageWine();
    await tx.wait();

    console.log(`Claim tx hash: ${tx.hash}`);

    // some will be lost to the cellar ofc

    const vintageBalance = await vintage.balanceOf(address);

    console.log(
      `Claimed ${vintageAmountNumber} VINTAGE, balance is now ${ethers.utils.formatEther(
        vintageBalance
      )}`
    );

    const token = settings.token;

    // default slippage is 0.5% + price impact btw

    if (token == "AVAX") {
      // VINTAGE -> MIM -> AVAX
      let outputs = await router.getAmountsOut(vintageBalance, [
        vintage.address,
        MIM,
        WAVAX,
      ]);

      console.log(
        `Calculating swap to AVAX: ${ethers.utils.formatEther(
          vintageBalance
        )} VINTAGE to ${ethers.utils.formatEther(
          outputs[outputs.length - 1]
        )} AVAX output`
      );

      let minOut =
        // 1% slippage
        outputs[outputs.length - 1].sub(outputs[outputs.length - 1].div("100"));

      // take the dive
      let tx = await router.swapExactTokensForETH(
        vintageBalance,
        minOut,
        [vintage.address, MIM, WAVAX],
        address,
        // give it 5 minutes
        Math.round(Date.now() / 1000) + 5 * 60
      );
      await tx.wait();
      console.log("Swapped for AVAX - " + tx.hash);
    }

    if (token == "MIM") {
      // VINTAGE -> MIM
      let outputs = await router.getAmountsOut(vintageBalance, [
        vintage.address,
        MIM,
      ]);

      console.log(
        `Calculating swap to MIM: ${ethers.utils.formatEther(
          vintageBalance
        )} VINTAGE to ${ethers.utils.formatEther(
          outputs[outputs.length - 1]
        )} MIM output`
      );

      let minOut =
        // 1% slippage
        outputs[outputs.length - 1].sub(outputs[outputs.length - 1].div("100"));

      // take the dive
      let tx = await router.swapExactTokensForTokens(
        vintageBalance,
        minOut,
        [vintage.address, MIM],
        address,
        // give it 5 minutes
        Math.round(Date.now() / 1000) + 5 * 60
      );
      await tx.wait();
      console.log("Swapped for MIM - " + tx.hash);
    }

    if (token == "GRAPE") {
      // VINTAGE -> MIM -> GRAPE
      let outputs = await router.getAmountsOut(vintageBalance, [
        vintage.address,
        MIM,
        GRAPE,
      ]);

      console.log(
        `Calculating swap to GRAPE: ${ethers.utils.formatEther(
          vintageBalance
        )} VINTAGE to ${ethers.utils.formatEther(
          outputs[outputs.length - 1]
        )} GRAPE output`
      );

      let minOut =
        // 1% slippage
        outputs[outputs.length - 1].sub(outputs[outputs.length - 1].div("100"));

      // take the dive
      let tx = await router.swapExactTokensForTokens(
        vintageBalance,
        minOut,
        [vintage.address, MIM, GRAPE],
        address,
        // give it 5 minutes
        Math.round(Date.now() / 1000) + 5 * 60
      );
      await tx.wait();
      console.log("Swapped for GRAPE - " + tx.hash);
    }

    // all else: just hodl
  }
}

init();
