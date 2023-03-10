import React, { useState } from "react";
import {
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useCreateDirectListing,
} from "@thirdweb-dev/react";
import Header from "../components/Header";
import { NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import network from "../utils/network";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

type Props = {};

const Create = (props: Props) => {
  const router = useRouter();

  const [selectedNft, setSelectNft] = useState<NFT>();

  const address = useAddress();

  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );

  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  );

  const OwnedNFTs = useOwnedNFTs(collectionContract, address);

  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  console.log("My address is ", OwnedNFTs);

  const {
    mutate: createDirectListing,
    isLoading,
    error,
  } = useCreateDirectListing(contract);

  const {
    mutate: createAuctionListing,
    isLoading: isLoadingAuction,
    error: errorAuction,
  } = useCreateAuctionListing(contract);

  const handleCreateListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }

    if (!selectedNft) return;

    const target = e.target as typeof e.target & {
      elements: { listingType: { value: string }; price: { value: string } };
    };

    const { listingType, price } = target.elements;

    if (listingType.value === "directListing") {
      createDirectListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          tokenId: selectedNft.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
        },
        {
          onSuccess(data, variables, context) {
            toast.success("Direct Listing is successful..");
            router.push("/");
          },
          onError(error, variables, context) {
            console.log("ERROR: ", error, variables, context);
            toast.error("Whoops something went wrong..");
          },
        }
      );
    }

    if (listingType.value === "auctionListing") {
      createAuctionListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          buyoutPricePerToken: price.value,
          tokenId: selectedNft.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          startTimestamp: new Date(),
          reservePricePerToken: 0,
        },
        {
          onSuccess(data, variables, context) {
            console.log("SUCCESS", data, variables, context);
            toast.success("Auction Listing is successful..");
            router.push("/");
          },
          onError(error, variables, context) {
            console.log("ERROR: ", error, variables, context);
            toast.error("Whoops something went wrong..");
          },
        }
      );
    }
  };

  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">
          Select an Item you would like to sell
        </h2>
        <hr className="mb-5" />
        <p>Below you will find the NFT's you own in your wallet</p>

        <div className=" flex overflow-scroll space-x-2 p-4">
          {OwnedNFTs
            ? OwnedNFTs?.data?.map((nft) => (
                <div
                  key={nft.metadata.id}
                  onClick={() => setSelectNft(nft)}
                  className={`flex flex-col space-x-2 card min-w-fit border-2 bg-gray-100
					${
            nft.metadata.id === selectedNft?.metadata.id
              ? "border-black"
              : "border-transparent"
          }
					`}
                >
                  <MediaRenderer
                    className="h-48 rounded-lg"
                    src={nft.metadata.image}
                  />
                  <p className="text-lg truncate font-bold">
                    {nft.metadata.name}
                  </p>
                  <p className="text-xs truncate">
                    {nft.metadata.description}{" "}
                  </p>
                </div>
              ))
            : !OwnedNFTs
            ? "NFT IS NOT AVAILABLE"
            : ""}
        </div>

        {selectedNft && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className="grid grid-cols-2 gap-5">
                <label className="border-r font-light">
                  Direct Listing / Fixed Price
                </label>
                <input
                  type="radio"
                  name="listingType"
                  value="directListing"
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light">Auction</label>
                <input
                  type="radio"
                  value="auctionListing"
                  name="listingType"
                  className="ml-auto h-10 w-10"
                />

                <label className="border-r font-light">Price</label>
                <input
                  type="text"
                  placeholder="0.05"
                  className="bg-gray-100 p-5"
                  name="price"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lf p-4 mt-8"
              >
                {isLoading
                  ? "Directing Listing Processing ..."
                  : isLoadingAuction
                  ? "Auction Listing Processing ..."
                  : "Create Listing"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Create;
