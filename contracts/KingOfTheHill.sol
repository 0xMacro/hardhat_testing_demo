// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

/* 

King of the Hill

Requirements:
  - Deployer is initial king. Height is any msg.value they send in creation transaction.
  - Any address can "overthrow" current king by sending more ETH than the existing height
    - Current king cannot call "overthrow"
    - When king is overthrown, previous king should get payout equal to new height
  - Current king can increase the height by sending ETH directly to the contract
*/

contract KingOfTheHill {
  struct Hill {
    address king;
    uint256 height;
  }

  Hill public hill;

  event NewKing(address newKing, uint256 newHeight);

  event IncreasedHeight(uint256 newHeight);

  error InsufficientAmount();

  constructor() payable {
    hill.king = msg.sender;
    hill.height = msg.value;
  }

  function overthrow() external payable {
    require(msg.sender != hill.king, "Cannot overthrow self");

    if (msg.value <= hill.height) {
      revert InsufficientAmount();
    }

    address oldKing = hill.king;

    hill.king = msg.sender;
    hill.height = msg.value;

    oldKing.call{ value: msg.value }("");

    emit NewKing(msg.sender, msg.value);
  }

  receive() external payable {
    require(msg.sender == hill.king, "Only king can increase height");

    hill.height += msg.value;

    emit IncreasedHeight(hill.height);
  }
}
