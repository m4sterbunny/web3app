'use client';

import { useAccount, useBalance, useEnsAvatar, useEnsName } from 'wagmi';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import { formatEther } from 'viem';
import Image from 'next/image';
import SendEthModal from './sendEthModal';
import SendErc20Modal from './sendErc20Modal';
import { fetchRandomNftImage } from './web3helpers/openseaHelper'; // Import the helper function

export function Account() {
  const [isMounted, setIsMounted] = useState(false);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(null);
  const { address: userAddress, chain, chainId, isConnected } = useAccount();
  const { data: accountBalance } = useBalance({ address: userAddress });
  const { data: ensName } = useEnsName({ address: userAddress, chainId: mainnet.id });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName!, chainId: mainnet.id });

  // Fetch the NFT image URL using the helper function
  useEffect(() => {
    fetchRandomNftImage().then((imageUrl) => {
      setNftImageUrl(imageUrl);
    }).catch((error) => {
      console.error(error);
      setNftImageUrl(null);
    });
  }, []);

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

  return (
    <div className="flex flex-col items-center text-center gap-y-4">
      <div className="flex items-center gap-x-2">
        <Image
          alt="Avatar"
          src={ensAvatar || nftImageUrl || '/assets/pepe.png'} // ENS avatar, NFT image, or fallback
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
      {nftImageUrl ? (
        <div className="mt-8">
          <img src={nftImageUrl} alt="NFT Image" className="h-16 w-16 rounded-full" />
        </div>
      ) : (
        <div className="mt-8">
          <p>Image not found</p>
        </div>
      )}
    </div>
  );
}
