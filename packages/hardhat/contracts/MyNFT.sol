// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
	uint256 private _nextTokenId;
	mapping(address => string[]) addrToMintedNfts;

	constructor() ERC721("MyNFT", "MDFK") {}

	function safeMint(
		address recipient,
		string memory tokenURI,
		string memory badgeType
	) public returns (uint256) {
		if (containsString(addrToMintedNfts[recipient], badgeType)) {
			revert("Already minted");
		}

		addrToMintedNfts[recipient].push(badgeType);

		uint256 tokenId = _nextTokenId++;
		_safeMint(recipient, tokenId);
		_setTokenURI(tokenId, tokenURI);

		return tokenId;
	}

	function getNextId() public view returns (uint256) {
		return _nextTokenId + 1;
	}

	function getMintableNFTs(
		address _addr,
		int _rating
	) public view returns (string[] memory) {
		string[] memory mintableNFTs = new string[](3); // Assuming a maximum of 3 elements
		uint256 count = 0;

		if (
			_rating > 500 && !containsString(addrToMintedNfts[_addr], "Breakey")
		) {
			mintableNFTs[count++] = "Breakey";
		}
		if (
			_rating > 1000 &&
			!containsString(addrToMintedNfts[_addr], "Middlebreaker")
		) {
			mintableNFTs[count++] = "Middlebreaker";
		}
		if (
			_rating > 1500 &&
			!containsString(addrToMintedNfts[_addr], "Breakeroo")
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
	) public pure returns (bool) {
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
}
