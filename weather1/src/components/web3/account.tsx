'use client';

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import { formatEther } from 'viem';
import Image from 'next/image';
import SendEthModal from './sendEthModal';
import SendErc20Modal from './sendErc20Modal';

export function Account() {
  // State to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);
  
  // State to store the NFT image URL
  const [nftImageUrl, setNftImageUrl] = useState<string>('');
  
  // Wagmi hooks to get account-related data
  const { address: userAddress, chain, chainId, isConnected } = useAccount();
  const { data: accountBalance } = useBalance({ address: userAddress });
  const { data: ensName } = useEnsName({ address: userAddress, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: mainnet.id });

  // useEffect to handle component mount logic
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  // If the component is not yet mounted, show a loading message
  if (!isMounted) {
    return <div><p className="text-lg">Loading...</p></div>;
  }

  // If the user is not connected, show a "Not connected" message
  if (!isConnected) {
    return <div><p className="text-lg">Not connected</p></div>;
  }

  // Format the account balance to display in ETH
  const formattedBalance = accountBalance ? formatEther(accountBalance.value) : '0';
  
  // Fallback image if ENS avatar is not available
  const fallbackImage = '/assets/pepe.png';

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
    </div>
  );
}
