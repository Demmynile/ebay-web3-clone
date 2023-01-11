import { useRouter } from 'next/router';
import React ,{useEffect, useState} from 'react'
import Header from '../../components/Header';
import {
	useContract,
	MediaRenderer,
	useListing
  } from '@thirdweb-dev/react'
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { ListingType } from '@thirdweb-dev/sdk';

type Props = {}

const ListingPage = (props: Props) => {
	const [minimumNextBid , setMinimumNextBid] = useState<{
      displayValue : string;
	  symbol: string
	}>()
	const router = useRouter();
	const {listingId} = router.query as {listingId : string}

	const {contract} = useContract(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT , "marketplace")
	const {data: listing , isLoading , error} = useListing(contract , listingId )

	useEffect(() => {
        if (!listingId || !contract || !listing) return;
		if(listing.type === ListingType.Auction) {
			fetchMinNextBid();
		}
	} , [listingId , listing , contract])

	console.log(minimumNextBid)


	const fetchMinNextBid = async() => {
      if(!listingId || !contract) return;

	  const {displayValue , symbol}= await contract.auction.getMinimumNextBid(listingId)

	  setMinimumNextBid({
		displayValue : displayValue,
		symbol : symbol
	  })



	}

	if(isLoading) return (
		<div>
           <Header />
		   <div className='text-center animate-pulse text-blue-500'> 
			<p>Loading Item ...</p>
		   </div>
		</div>
	   )
	

	if(!listing){
		return <div>
			Listing not found
		</div>
	}






	const formatPlaceholder = () => {

		if (!listing) return ;

		 if (listing.type === ListingType.Direct){
			return "Enter Offer Amount"
		 }

		 if (listing.type === ListingType.Auction){
			return "Enter Bid Amount"
		 }
		 
	}


  return (
	<div>
		<Header />
		
		<main className='max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10'>
			<div className='p-10 border mx-auto  lg:mx-0 max-w-md lg:max-w-xl'>
            <MediaRenderer src={listing?.asset.image} /> 
			</div>

			<section className='flex-1 space-y-5 pb-20 lg:pb-0'>
				<div>
					<h1>{listing.asset.name}</h1>
					<p>{listing.asset.description}</p>
					<p className='flex items-center text-xs sm:text-base'>
						<UserCircleIcon
						className='h-5'
						/> 
						
						<span className='font-bold pr-1'>Seller:</span>
						{listing.sellerAddress}

					</p>
				</div>
				<div className='grid grid-cols-2 items-center py-2'> 
					<p className='font-bold'>Listing Type: </p>
					<p>{listing.type === ListingType.Direct ? "Direct Listing" : "Auction Listing" }</p>
					<p className='font-bold'>Buy it Now Price:</p>
					<p className='text-4xl font-bold'>
						{listing.buyoutCurrencyValuePerToken.displayValue}{" "}
						{listing.buyoutCurrencyValuePerToken.symbol}
					 
				    </p>
					<button className='col-start-2 mt-2 rounded-full  bg-blue-600 font-bold text-white w-44 py-4 px-10'>
                       Buy Now
					</button>
				</div>

				<div className='grid grid-cols-2 space-y-2 items-center justify-end'>
				   <hr className='col-span-2' />
				   <p className='col-span-2 font-bold'>
					{listing.type === ListingType.Direct ? "Make an Offer" : "Bid on this Auction"}
				   </p>

				   {listing.type === ListingType.Auction && (
					<>
					 <p>Current Minimum Bid</p>
					 <p>...</p>
					 <p>Time Remaining</p>
					 <p>...</p>
					</>
				   )}

				  <input  className='border p-2 rounded-lg mr-5 ' type="text"  placeholder={formatPlaceholder()}/>
				  <button className='bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10'>
					{listing.type === ListingType.Direct ? "Offer" : "Bid"}
				  </button>
				</div>
			</section>
		</main>
	</div>
  )
}

export default  ListingPage