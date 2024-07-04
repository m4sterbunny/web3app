'use client'; 
// Ensures this file is treated as a client-side component in Next.js

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import Image from 'next/image';
import BootcampTokenABI from '../../lib/contracts/BootcampTokenABI';


export function Account() {
  
  const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID ?? '';
  const [isMounted, setIsMounted] = useState(false);
  // State to check if component is mounted

  const { address, chain, chainId, isConnected } = useAccount();
  // Destructure account details from useAccount hook

  const { data: balanceData, isError, isLoading } = useBalance({ address });
  // Fetch balance using useBalance hook

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
    console.log("Component mounted");
  }, [isMounted]);
  // Effect to set isMounted to true once the component mounts

  useEffect(() => {
    console.log("Balance Data:", balanceData);
    console.log("Is Loading:", isLoading);
    console.log("Is Error:", isError);
  }, [balanceData, isLoading, isError]);
  // Log balance data, loading state, and error state for debugging

  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  // Fetch ENS name using useEnsName hook

  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: mainnet.id });
  // Fetch ENS avatar using useEnsAvatar hook

  if (!isMounted) {
    return null;
  }
  // Ensure client-side rendering consistency

  if (!isConnected) {
    return (
      <div>
        <p className="text-lg">Not connected</p>
      </div>
    );
  }
  // Return a message if the user is not connected

  if (isLoading) {
    console.log("Loading balance...");
    return <div>Fetching balance…</div>;
  }
  // Return a message while balance is being fetched

  if (isError) {
    console.log("Error fetching balance");
    return <div>Error fetching balance</div>;
  }
  // Return a message if there's an error fetching the balance

  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      {ensAvatar && ensName && (
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
      {/* Display ENS avatar and name if available and component is mounted */}
      
      {address && (
        <>
          <p className="text-lg">{address}</p>
        </>
      )}
      {/* Display the user's address if available and component is mounted */}

      {/* <SendErc20Modal userAddress={address} /> Killing attempt to Pass the userAddress to child prop directly */}

      <div className="flex flex-col gap-y-2">
        {balanceData && (
          <p className="text-xl">
            Balance: {(Number(balanceData.value) / 1e18).toFixed(4)} ETH
          </p>
        )}
        {/* Display the balance formatted to 4 decimal places if balance data is available */}

        {chain && chainId && (
          <p className="text-lg">
            {chain.name}, chainId: {chainId}
          </p>
        )}
        {/* Display chain name and chain ID if available and component is mounted */}
      </div>
    </div>
  );
}
