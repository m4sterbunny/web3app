'use client';

// Import necessary hooks and components from wagmi, React, and viem
import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import { formatEther } from 'viem';
import Image from 'next/image';
import SendEthModal from './sendEthModal';
import SendErc20Modal from './sendErc20Modal';
// import { fetchRandomAvatar } from './openseaHelper'; // Import the helper function
// import SwapErc20Modal from './swapErc20Modal';

export function Account() {
  const [isMounted, setIsMounted] = useState(false);
  // const [randomAvatar, setRandomAvatar] = useState<{ imageUrl: string, openseaLink: string } | null>(null); // State for random avatar
  // const [apiKey] = useState(process.env.NEXT_PUBLIC_OPENSEA_API_KEY); // Store OpenSea API key

  const { address: userAddress, chain, chainId, isConnected } = useAccount();
  const { data: accountBalance } = useBalance({ address: userAddress });
  const { data: ensName } = useEnsName({ address: userAddress, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: mainnet.id });

  // Fetch a random avatar from OpenSea if there is no ENS avatar
  /*
  useEffect(() => {
    if (!ensAvatar && !randomAvatar && apiKey) {
      fetchRandomAvatar(apiKey).then(setRandomAvatar);
    }
  }, [ensAvatar, randomAvatar, apiKey]);
  */

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

  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      <div className="flex items-center gap-x-2">
        <Image
          alt="Avatar"
          src={ensAvatar || '/assets/pepe.png'} // Fallback to Pepe image if no avatar
          className="h-16 w-16 rounded-full"
          height={64}
          width={64}
        />
        {ensName && <p className="text-2xl">{ensName}</p>}
        {/*
        {randomAvatar && !ensAvatar && (
          <div>
            <a href={randomAvatar.openseaLink} target="_blank" rel="noopener noreferrer">
              View on OpenSea
            </a>
          </div>
        )}
        */}
      </div>
      {userAddress && <p className="text-lg">{userAddress}</p>}
      <div className="flex flex-col gap-y-2">
        {accountBalance && (
           <p className="text-xl">
           Balance: {parseFloat(accountBalance.formatted).toFixed(2)} ETH
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
          <SendEthModal userAddress={userAddress} userBalance={accountBalance?.formatted} chainId={chainId} />
        </div>
        <div className="w-2/5">
          <SendErc20Modal userAddress={userAddress} userBalance={accountBalance?.formatted} />
        </div>
        {/* Uncomment the following block to render the SwapErc20Modal component */}
        {/* <div className="w-2/5">
          <SwapErc20Modal userAddress={userAddress} />
        </div> */}
      </div>
    </div>
  );
}
