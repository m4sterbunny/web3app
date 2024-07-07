// transactionHelper.ts abstracts away common functions used by sendErc20 and sendEth
import { useState, useEffect } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';

type UseTransactionHelperProps = {
  chainId: number;
};

export function useTransactionHelper({ chainId }: UseTransactionHelperProps) {
  const [isTransactionConfirmed, setIsTransactionConfirmed] = useState(false);

  const { data: hash, isPending, sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      setIsTransactionConfirmed(true);
    }
  }, [isConfirmed]);

// todo: get dynamic source of blockexplorers
// not necessary for boilerplate app -- this was part of getting alt avatar from opensea
  const getExplorerLink = (hash: string) => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return `https://etherscan.io/tx/${hash}`;
      case 137: // Polygon Mainnet
        return `https://polygonscan.com/tx/${hash}`;
      case 80001: // Mumbai Testnet
        return `https://mumbai.polygonscan.com/tx/${hash}`;
      case 2442: // Cardano zkEVM
        return `https://cardona-zkevm.polygonscan.com/tx/${hash}`;
      default:
        return `https://cardona-zkevm.polygonscan.com/tx/${hash}`;
    }
  };

  return {
    hash,
    isPending,
    isConfirming,
    isTransactionConfirmed,
    sendTransaction,
    getExplorerLink,
  };
}
