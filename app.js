const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const abi = [/* PASTE ABI FROM HARDHAT ARTIFACTS */];
let provider, signer, contract, account;

async function init() {
    const connectButton = document.getElementById("connectWallet");
    const flipButton = document.getElementById("flipCoin");
    const betInput = document.getElementById("betAmount");
    const result = document.getElementById("result");

    connectButton.onclick = connectWallet;
    flipButton.onclick = flipCoin;

    async function connectWallet() {
        if (window.ethereum) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            account = await signer.getAddress();
            contract = new ethers.Contract(contractAddress, abi, signer);
            connectButton.textContent = `Connected: ${account.slice(0, 6)}...`;
            flipButton.disabled = false;
        } else {
            alert("Install MetaMask!");
        }
    }

    async function flipCoin() {
        const bet = betInput.value;
        if (!bet || bet < 1 || bet > 10) {
            result.textContent = "Enter a valid bet (1-10 MATIC)";
            return;
        }

        try {
            const tx = await contract.flipCoin(ethers.utils.parseEther(bet), {
                value: ethers.utils.parseEther(bet),
                gasLimit: 100000
            });
            result.textContent = "Flipping...";
            const receipt = await tx.wait();
            const event = receipt.events.find(e => e.event === "FlipResult");
            const [player, betAmount, won, payout] = event.args;
            result.textContent = won
                ? `You won! Payout: ${ethers.utils.formatEther(payout)} MATIC`
                : "You lost!";
        } catch (error) {
            result.textContent = `Error: ${error.message}`;
        }
    }
}

window.onload = init;