'use client'; // Ensures this file is treated as a client-side component in Next.js

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react'; // Import hooks from React
import Image from 'next/image'; // Import Next.js Image component for optimized images
import { formatEther } from 'viem/utils'; // Import formatEther from viem

export function Account() {
  const [isMounted, setIsMounted] = useState(false); // State to manage if the component is mounted
  const [delayedAddress, setDelayedAddress] = useState(''); // State to store address with delay
  const [delayedChainId, setDelayedChainId] = useState(null); // State to store chain ID with delay

  // Get user's account information
  const { address, chain, chainId, isConnected } = useAccount();

  // Effect to set the component as mounted after it renders for the first time
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add delay before setting the address and chain ID
  useEffect(() => {
    if (address && chainId) {
      console.log('Starting timer delay for address and chainId');
      const timer = setTimeout(() => {
        setDelayedAddress(address);
        setDelayedChainId(chainId);
        console.log('Timer delay complete: Address and Chain ID set', { address, chainId });
      }, 500); // 500ms delay

      return () => {
        clearTimeout(timer); // Cleanup timer on unmount
        console.log('Timer cleared');
      };
    }
  }, [address, chainId]);

  // Get user's balance using delayed address and chain ID
  const { data: balanceData, isLoading: isBalanceLoading, error: balanceError } = useBalance({
    address: delayedAddress,
    chainId: delayedChainId,
  });

  // Get ENS name associated with the user's address
  const { data: ensName, isLoading: isEnsNameLoading, error: ensNameError } = useEnsName({
    address: delayedAddress,
    chainId: delayedChainId,
  });

  // Get ENS avatar associated with the user's ENS name
  const { data: ensAvatar, isLoading: isEnsAvatarLoading, error: ensAvatarError } = useEnsAvatar({
    name: ensName!,
    chainId: delayedChainId,
  });

  // Enhanced debugging logs
  useEffect(() => {
    console.log('Address:', address);
    console.log('Delayed Address:', delayedAddress);
    console.log('Chain:', chain);
    console.log('Chain ID:', chainId);
    console.log('Delayed Chain ID:', delayedChainId);
    console.log('Balance Data:', balanceData);
    console.log('Is Balance Loading:', isBalanceLoading);
    console.log('Balance Error:', balanceError);
  }, [address, delayedAddress, chain, chainId, delayedChainId, balanceData, isBalanceLoading, balanceError]);

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
                Balance: {balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(5) : 'N/A'} ETH {/* Format balance to 5 decimal places */}
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
