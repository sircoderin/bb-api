// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BubbleBreakerBadge is ERC721URIStorage, Ownable {
	uint256 private _nextTokenId;
	mapping(address => string[]) addrToMintedNFTs;
	mapping(address => string[]) addrToMintableNFTs;

	constructor() ERC721("Bubble Breaker Badge", "BBB") {}

	function safeMint(
		address recipient,
		string memory tokenURI,
		string memory badgeType
	) public returns (uint256) {
		if (containsString(addrToMintedNFTs[recipient], badgeType)) {
			revert("Already minted");
		}
		if (!containsString(addrToMintableNFTs[recipient], badgeType)) {
			revert("NFT not whitelisted for address");
		}

		addrToMintedNFTs[recipient].push(badgeType);
		removeMintableNFT(recipient, badgeType);

		uint256 tokenId = _nextTokenId++;
		_safeMint(recipient, tokenId);
		_setTokenURI(tokenId, tokenURI);

		return tokenId;
	}

	function getNextId() public view returns (uint256) {
		return _nextTokenId + 1;
	}

	function getPublicMintableNFTs(
		address _addr
	) public view returns (string[] memory) {
		return addrToMintableNFTs[_addr];
	}

	function getMintedNFTs(
		address _addr
	) public view returns (string[] memory) {
		return addrToMintedNFTs[_addr];
	}

	function updateMintableNFTs(address addr, int rating) public onlyOwner {
		// TODO_BB revert if no mintable NFTs
		addrToMintableNFTs[addr] = getMintableNFTs(addr, rating);
	}

	function getMintableNFTs(
		address _addr,
		int _rating
	) private view onlyOwner returns (string[] memory) {
		string[] memory mintableNFTs = new string[](3); // Assuming a maximum of 3 elements
		uint256 count = 0;

		if (
			_rating > 10 && !containsString(addrToMintedNFTs[_addr], "Breakey")
		) {
			mintableNFTs[count++] = "Breakey";
		}
		if (
			_rating > 30 &&
			!containsString(addrToMintedNFTs[_addr], "Middlebreaker")
		) {
			mintableNFTs[count++] = "Middlebreaker";
		}
		if (
			_rating > 60 &&
			!containsString(addrToMintedNFTs[_addr], "Breakeroo")
		) {
			mintableNFTs[count++] = "Breakeroo";
		}

		// Create a new memory array with the correct size and copy elements from mintableNFTs
		string[] memory result = new string[](count);
		for (uint256 i = 0; i < count; i++) {
			result[i] = mintableNFTs[i];
		}

		return result;
	}

	function containsString(
		string[] memory _list,
		string memory _value
	) private pure returns (bool) {
		for (uint i = 0; i < _list.length; i++) {
			if (
				keccak256(abi.encodePacked((_list[i]))) ==
				keccak256(abi.encodePacked((_value)))
			) {
				return true;
			}
		}
		return false;
	}

	function removeMintableNFT(
		address _address,
		string memory _badgeType
	) private {
		string[] storage array = addrToMintableNFTs[_address];
		uint index = 0;
		bool found = false;

		for (uint i = 0; i < array.length; i++) {
			if (
				keccak256(abi.encodePacked((array[i]))) ==
				keccak256(abi.encodePacked((_badgeType)))
			) {
				index = i;
				found = true;
				break;
			}
		}

		if (found) {
			delete array[index];
			array[index] = array[array.length - 1];
			array.pop();
		}
	}
}
