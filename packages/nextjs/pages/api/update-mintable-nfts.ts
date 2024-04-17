import { getOwnerNFTContract, setRequest } from "../../utils/contract-helper";
import { definition } from "./runtime-definition.js";
import { ComposeClient } from "@composedb/client";
import { DID } from "dids";
import { ethers } from "ethers";
import gql from "graphql-tag";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import type { NextApiRequest, NextApiResponse } from "next";
import { fromString } from "uint8arrays/from-string";
import { hardhat } from "viem/chains";

const pkg = require("@apollo/client");

const { ApolloClient, ApolloLink, InMemoryCache, Observable } = pkg;

const getComposeDIDClient = async (did: DID) => {
  const compose = new ComposeClient({ ceramic: process.env.CERAMIC_API_ENDPOINT || "", definition });
  compose.setDID(did);

  const link = new ApolloLink((operation: any) => {
    return new Observable((observer: any) => {
      compose.execute(operation.query, operation.variables).then(
        result => {
          observer.next(result);
          observer.complete();
        },
        error => {
          observer.error(error);
        },
      );
    });
  });

  return new ApolloClient({ cache: new InMemoryCache(), link });
};

const loadAdminDID = async () => {
  const privateKey = fromString(process.env.DID_ADMIN_PRIVATE_KEY || "", "base16");

  const adminDID = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(privateKey),
  });
  await adminDID.authenticate();
  return adminDID;
};

const adminDID = await loadAdminDID();
const client = await getComposeDIDClient(adminDID);

const computeUserRating = async (beams: any[]) => {
  if (beams.length == 0) {
    return 0;
  }

  let aiRating = 0;

  for (const beam of beams) {
    if (beam.node.aiRating) {
      aiRating += beam.node.aiRating;
    }
  }

  console.log("total AI rating: ", aiRating);
  const beamIds = beams.map(beam => beam.node.id);
  console.log("beamIds:", beamIds);

  // TODO_BB compute actual total user rating using pagination
  const userRatings = await client.query({
    query: gql`
    query MyQuery {
      userRatingIndex(last: 100, filters: { where: { beamID: { in: [${beamIds.map(beamId => `"${beamId}"`)}]}}}) {
        edges {
          node {
            userRating
            beamID
          }
          cursor
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
      }
    }`,
  });

  const ratingsByBeamId = userRatings.data.userRatingIndex.edges.reduce((acc: any, rating: any) => {
    if (!acc[rating.node.beamID]) {
      acc[rating.node.beamID] = [];
    }
    acc[rating.node.beamID].push(rating.node);
    return acc;
  }, {});
  console.log("ratingsByBeamId:", ratingsByBeamId);

  let userRating = 0;
  for (const beamId in ratingsByBeamId) {
    const ratings = ratingsByBeamId[beamId];
    const totalRating = ratings.reduce((sum: number, rating: { userRating: number }) => sum + rating.userRating, 0);
    const averageRating = parseInt((totalRating / ratings.length).toString());
    userRating += averageRating;
  }

  console.log("user rating: ", userRating);
  console.log("total rating: ", aiRating + userRating);
  return aiRating + userRating;
};

const verifyMessage = async (message: string, address: string, signature: string) => {
  try {
    const signerAddr = ethers.verifyMessage(message, signature);
    if (signerAddr.toLocaleLowerCase() !== address) {
      return false;
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getUserBeams = async (userDid: string) => {
  const result = await client.query({
    query: gql`
    query GetBeamsByAuthorDid {
      node(id: "${userDid}") {
        ... on CeramicAccount {
          akashaBeamList(first: 100) {
            edges {
              node {
                id
                aiRating
              }
              cursor
            }
            pageInfo {
              startCursor
              endCursor
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    }`,
  });

  return result.data.node.akashaBeamList.edges;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!setRequest(req, res)) {
    return;
  }

  console.log("request body:", req.body);

  const verified = await verifyMessage("Bubble Breaker", req.body.address, req.body.signature);
  if (!verified) {
    res.status(500).json({ error: "Signature is invalid." });
  }

  // TODO_BB decide how to handle network id
  // we can be send it with the request or no longer include it in the DID since an ETH address should be one user
  const userDid = `did:pkh:eip155:${hardhat.id}:${req.body.address}`;

  try {
    const userBeams = await getUserBeams(userDid);
    console.log("userBeams:", userBeams);

    const totalRating = await computeUserRating(userBeams);
    console.log("totalRating:", totalRating);

    await getOwnerNFTContract().updateMintableNFTs(req.body.address, totalRating);
    res.status(200).json({ result: "updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating NFT." });
  }
}
