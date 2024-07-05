'use client';

// Import necessary hooks and components from wagmi, React, and viem
import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import Image from 'next/image';
import SendEthModal from './sendEthModal';
import SendErc20Modal from './sendErc20Modal';
// import SwapErc20Modal from './swapErc20Modal';

export function Account() {
  // State to check if the component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // Use the useAccount hook to get user's account details
  const { address: userAddress, chain, chainId, isConnected } = useAccount();

  // Get the user's balance
  const { data: accountBalance } = useBalance({
    address: userAddress,
  });

  // Get the ENS name associated with the user's address
  const { data: ensName } = useEnsName({
    address: userAddress,
    chainId: mainnet.id,
  });

  // Get the ENS avatar associated with the user's ENS name
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName!,
    chainId: mainnet.id,
  });

  // useEffect hook to set isMounted to true when the component mounts
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  // If the component is not mounted, show a loading message
  if (!isMounted) {
    return (
      <div>
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // If the user is not connected, show a not connected message
  if (!isConnected) {
    return (
      <div>
        <p className="text-lg">Not connected</p>
      </div>
    );
  }

  // Main return block to render the account details
  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      {ensAvatar && ensName && (
        // Display ENS avatar and name if they exist
        <div className="flex items-center gap-x-2">
          <Image
            alt="ENS Avatar"
            src={ensAvatar}
            className="h-16 w-16 rounded-full"
            height={64}
            width={64}
          />
          {ensName && <p className="text-2xl">{ensName}</p>}
        </div>
      )}
      {userAddress && (
        // Display the user's address if it exists
        <>
          <p className="text-lg">{userAddress}</p>
        </>
      )}
      <div className="flex flex-col gap-y-2">
        {accountBalance && (
          // Display the user's balance if it exists
          <p className="text-xl">
            Balance: {parseFloat(accountBalance.formatted).toFixed(2)} ETH
          </p>
        )}
        {chain && chainId && (
          // Display the connected chain name and chain ID if they exist
          <p className="text-lg">
            {chain.name}, chainId: {chainId}
          </p>
        )}
      </div>
      <div className="flex justify-center gap-x-8">
        <div className="w-2/5">
          {/* Render the SendEthModal component and pass the userAddress, userBalance, and chainId as props */}
          <SendEthModal userAddress={userAddress} userBalance={accountBalance?.formatted} chainId={chainId} />
        </div>
        <div className="w-2/5">
          {/* Render the SendErc20Modal component and pass the userAddress and userBalance as props */}
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
