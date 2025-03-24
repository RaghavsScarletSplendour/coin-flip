// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinFlip {
    address public owner;
    uint256 public houseFeePercent = 2; // 2% fee
    uint256 public prizePool;

    event FlipResult(address player, uint256 betAmount, bool won, uint256 payout);

    constructor() payable {
        owner = msg.sender;
        prizePool = msg.value; // Initial seed (e.g., 100 MATIC)
    }

    function flipCoin(uint256 betAmount) external payable {
        require(msg.value == betAmount, "Sent MATIC must match bet amount");
        require(betAmount > 0, "Bet must be greater than 0");
        require(prizePool >= betAmount * 2, "Insufficient prize pool");

        // Basic RNG (not secure; for POC only)
        bool won = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 2) == 0;

        if (won) {
            uint256 payout = (betAmount * 2) - ((betAmount * houseFeePercent) / 100);
            prizePool -= payout;
            payable(msg.sender).transfer(payout);
            emit FlipResult(msg.sender, betAmount, true, payout);
        } else {
            prizePool += betAmount;
            emit FlipResult(msg.sender, betAmount, false, 0);
        }
    }

    // Owner can add to prize pool
    function seedPool() external payable {
        require(msg.sender == owner, "Only owner");
        prizePool += msg.value;
    }

    // Check contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}