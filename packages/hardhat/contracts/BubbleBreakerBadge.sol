// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BubbleBreakerBadge is ERC721URIStorage, Ownable {
	struct badgeType {
		string name; // unique name, used as identifier
		string tokenURI;
		uint rating;
	}

	uint256 private _nextTokenId;
	badgeType[] badgeTypes; // should always stay sorted by rating because safeMint is optimized based on this
	mapping(address => string[]) addrToMintedNFTs;

    // Event Definitions
    event BadgeMinted(address indexed minter, uint256 indexed tokenId, string badgeName);
    event RatingVerified(address indexed verifier, uint256 rating);

	constructor() ERC721("Bubble Breaker Badge", "BBB") {}

	function safeMint(
        uint256 rating,
        bytes calldata signature
	) public returns (uint256[] memory) {
        // Verify the signature
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, ":", Strings.toString(rating)));
        require(recoverSigner(messageHash, signature) == owner(), "Invalid signature");

        // Emit RatingVerified event
        emit RatingVerified(msg.sender, rating);

		uint badgeIndex = 0;
		uint256[] memory tempTokenIds = new uint256[](badgeTypes.length); 
		uint mintedTokenCount = 0;

		while (badgeIndex < badgeTypes.length) {
			if (!containsString(addrToMintedNFTs[msg.sender], badgeTypes[badgeIndex].name)) {
				if (rating > badgeTypes[badgeIndex].rating) {
					addrToMintedNFTs[msg.sender].push(badgeTypes[badgeIndex].name);

					uint256 tokenId = _nextTokenId++;
					_safeMint(msg.sender, tokenId);
					_setTokenURI(tokenId, badgeTypes[badgeIndex].tokenURI);
					tempTokenIds[mintedTokenCount] = tokenId;
					mintedTokenCount++;

					// Emit BadgeMinted event
                    emit BadgeMinted(msg.sender, tokenId, badgeTypes[badgeIndex].name);
				} else {
					break;
				}
			}

			badgeIndex++;
		}

		// Create the final array with the exact size
		uint256[] memory mintedTokenIds = new uint256[](mintedTokenCount);
		for (uint i = 0; i < mintedTokenCount; i++) {
			mintedTokenIds[i] = tempTokenIds[i];
		}

		return mintedTokenIds;
	}

	function getNextId() public view returns (uint256) {
		return _nextTokenId + 1;
	}

	function getMintedNFTs(
		address _addr
	) public view returns (string[] memory) {
		return addrToMintedNFTs[_addr];
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

    function recoverSigner(bytes32 messageHash, bytes memory signature) internal pure returns (address) {
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function getEthSignedMessageHash(bytes32 messageHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

	function getAllBadgeTypes()
		public
		view
		returns (
			string[] memory names,
			string[] memory tokenURIs,
			uint[] memory ratings
		)
	{
		uint256 length = badgeTypes.length;
		names = new string[](length);
		tokenURIs = new string[](length);
		ratings = new uint[](length);

		for (uint256 i = 0; i < length; i++) {
			badgeType memory badge = badgeTypes[i];
			names[i] = badge.name;
			tokenURIs[i] = badge.tokenURI;
			ratings[i] = badge.rating;
		}

		return (names, tokenURIs, ratings);
	}

	function addBadgeType(string calldata _name, string calldata _tokenURI, uint _rating) public onlyOwner {
		uint badgeIndex = 0;

		// Find the correct position to insert the new badge based on rating
		while (badgeIndex < badgeTypes.length && badgeTypes[badgeIndex].rating < _rating) {
			badgeIndex++;
		}

		// Resize the array and shift elements to the right to make room for the new badge
		badgeTypes.push();
		for (uint i = badgeTypes.length - 1; i > badgeIndex; i--) {
			badgeTypes[i] = badgeTypes[i - 1];
		}

		// Insert the new badge at the correct position
		badgeTypes[badgeIndex] = badgeType({
			name: _name,
			tokenURI: _tokenURI,
			rating: _rating
		});
	}

	function removeBadgeType(uint index) public onlyOwner {
        require(index < badgeTypes.length, "Index out of bounds");

        for (uint i = index; i < badgeTypes.length - 1; i++) {
            badgeTypes[i] = badgeTypes[i + 1];
        }

        badgeTypes.pop();
    }
}
