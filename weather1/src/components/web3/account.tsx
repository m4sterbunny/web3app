'use client';

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import { formatEther } from 'viem';
import Image from 'next/image';
import SendEthModal from './sendEthModal';
import SendErc20Modal from './sendErc20Modal';
// import { fetchLatestListings, getRandomListing } from './web3helpers/openseaHelper'; // Import the helper functions

export function Account() {
  const [isMounted, setIsMounted] = useState(false);
  const [nftImageUrl, setNftImageUrl] = useState<string>('');
  const { address: userAddress, chain, chainId, isConnected } = useAccount();
  const { data: accountBalance } = useBalance({ address: userAddress });
  const { data: ensName } = useEnsName({ address: userAddress, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: mainnet.id });

  // useEffect(() => {
  //   const randomListing = getRandomListing();
  //   if (randomListing && randomListing.assets.length > 0) {
  //     setNftImageUrl(randomListing.assets[0].image_url);
  //   }
  // }, []);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  if (!isMounted) {
    return <div><p className="text-lg">Loading...</p></div>;
  }

  if (!isConnected) {
    return <div><p className="text-lg">Not connected</p></div>;
  }

  const formattedBalance = accountBalance ? formatEther(accountBalance.value) : '0';
  const fallbackImage = '/assets/pepe.png'; // Provide a valid fallback image URL

  // const handleUpdateListings = async () => {
  //   await fetchLatestListings();
  // };

  // const handleRandomListing = () => {
  //   const randomListing = getRandomListing();
  //   if (randomListing && randomListing.assets.length > 0) {
  //     setNftImageUrl(randomListing.assets[0].image_url);
  //   }
  // };

  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      <div className="flex items-center gap-x-2">
        <Image
          alt="Avatar"
          src={ensAvatar || fallbackImage} // ENS avatar or fallback
          className="h-16 w-16 rounded-full"
          height={64}
          width={64}
        />
        {ensName && <p className="text-2xl">{ensName}</p>}
      </div>
      {userAddress && <p className="text-lg">{userAddress}</p>}
      <div className="flex flex-col gap-y-2">
        {accountBalance && (
          <p className="text-xl">
            Balance: {parseFloat(formattedBalance).toFixed(2)} ETH
          </p>
        )}
        {chain && chainId && (
          <p className="text-lg">
            {chain.name}, chainId: {chainId}
          </p>
        )}
      </div>
      <div className="flex justify-center gap-x-8">
        <div className="w-2/5">
          <SendEthModal userAddress={userAddress} userBalance={formattedBalance} chainId={chainId} />
        </div>
        <div className="w-2/5">
          <SendErc20Modal userAddress={userAddress} userBalance={formattedBalance} chainId={chainId} />
        </div>
      </div>
      {/* <div className="mt-8 w-full h-96 overflow-hidden relative">
        {nftImageUrl ? (
          <iframe
            src={nftImageUrl}
            className="w-full h-full border-none"
            title="NFT Page"
            onError={() => setNftImageUrl('')}
          />
        ) : (
          <p>iframe failed</p>
        )}
      </div> */}
      {/* <button onClick={handleUpdateListings} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Update Listings
      </button>
      <button onClick={handleRandomListing} className="mt-4 p-2 bg-green-500 text-white rounded">
        Show Random Listing
      </button> */}
    </div>
  );
}
