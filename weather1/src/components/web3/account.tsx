'use client'; // Ensures this file is treated as a client-side component in Next.js

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react'; // Import hooks from React
import { mainnet } from 'viem/chains'; // Import mainnet chain from viem
import Image from 'next/image'; // Import Next.js Image component for optimized images
import { formatEther } from 'viem/utils'; // Import formatEther from viem

export function Account() {
  const [isMounted, setIsMounted] = useState(false); // State to manage if the component is mounted

  // Get user's account information
  const { address, chain, chainId, isConnected } = useAccount();

  // Get user's balance
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  // Get ENS name associated with the user's address
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  // Get ENS avatar associated with the user's ENS name
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName!,
    chainId: mainnet.id,
  });

  // Effect to set the component as mounted after it renders for the first time
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debugging logs
  useEffect(() => {
    console.log('Address:', address);
    console.log('Balance Data:', balanceData);
    console.log('Is Balance Loading:', isBalanceLoading);
  }, [address, balanceData, isBalanceLoading]);

  // If the user is not connected, display a message
  if (!isConnected) {
    return (
      <div>
        <p className="text-lg">Not connected</p>
      </div>
    );
  }

  // Main render for the connected state
  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      {/* Display placeholder content during initial server render */}
      {!isMounted && (
        <div className="w-full">
          <p>Loading...</p>
        </div>
      )}
      {/* Always render the same structure, then update with data after mounting */}
      {isMounted && (
        <>
          {/* Display ENS avatar and name if available */}
          {ensAvatar && ensName && (
            <div className="flex items-center gap-x-2">
              <Image
                alt="ENS Avatar"
                src={ensAvatar}
                className="h-16 w-16 rounded-full"
                height={64}
                width={64}
              />
              <p className="text-2xl">{ensName}</p>
            </div>
          )}
          {/* Display the user's address */}
          <p className="text-lg">{address}</p>
          <div className="flex flex-col gap-y-2">
            {/* Display loading message or the user's balance */}
            {isBalanceLoading ? (
              <p>Loading balance...</p>
            ) : (
              <p className="text-xl">
                Balance: {parseFloat(formatEther(balanceData?.value ?? 0n)).toFixed(5)} ETH {/* Format balance to 5 decimal places */}
              </p>
            )}
            {/* Display the connected chain and chain ID */}
            <p className="text-lg">
              {chain?.name}, chainId: {chainId}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
