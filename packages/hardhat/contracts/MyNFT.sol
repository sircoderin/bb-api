// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
	uint256 private _nextTokenId;

	constructor() ERC721("MyNFT", "MDFK") {}

	function safeMint(
		address recipient,
		string memory tokenURI
	) public onlyOwner returns (uint256) {
		uint256 tokenId = _nextTokenId++;
		_safeMint(recipient, tokenId);
		_setTokenURI(tokenId, tokenURI);

		return tokenId;
	}

	function getNextId() public view returns (uint256) {
		return _nextTokenId + 1;
	}
}
