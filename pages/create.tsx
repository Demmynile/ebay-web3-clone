import React from 'react'
import { 
	  useAddress,
	  useContract,
	  MediaRenderer,
	  useNetwork,
	  useNetworkMismatch,
	  useOwnedNFTs,
	  useCreateAuctionListing,
	  useCreateDirectListing
	  } from '@thirdweb-dev/react'
import Header from '../components/Header'

type Props = {}

const Create = (props: Props) => {

	const address = useAddress()
	const {contract} = useContract(
		process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
		"marketplace"
	)
	
	const {contract : collectionContract} = useContract(
		process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
		"nft-collection"
	)
	
	const OwnedNFTs = useOwnedNFTs( collectionContract , address)

	console.log("My address is " , OwnedNFTs)


  return (
	<div>
		<Header />

		<main className='max-w-6xl mx-auto p-10 pt-2'>
			<h1 className='text-4xl font-bold'>List an Item</h1>
			<h2 className='text-xl font-semibold pt-5'>Select an Item you would like to sell</h2>
			<hr  className='mb-5'/>
			<p>Below you will find the NFT's you own in your wallet</p>

		</main>
	</div>
  )
}

export default Create