'use client';

import { useEffect, useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import BootcampTokenABI from '../../lib/contracts/BootcampTokenABI';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Link from 'next/link';
import { ExternalLinkIcon, RefreshCw } from 'lucide-react';
import { useTransactionHelper } from './web3helpers/transactionHelper'; // Import the helper function

// Define the props expected by the component
type SendErc20ModalProps = {
  userAddress: `0x${string}` | undefined;
  userBalance: string | undefined;
  chainId: number; // Include chainId as a prop
};

export default function SendErc20Modal({ userAddress, userBalance, chainId }: SendErc20ModalProps) {
  const [toAddress, setToAddress] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const erc20ContractAddress = process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS ?? '';

  // Use the helper function for transaction logic
  const { hash, isPending, isConfirming, isTransactionConfirmed, sendTransaction, getExplorerLink } = useTransactionHelper({ chainId });

  // Hook to read the ERC20 balance of the user
  const { data: erc20Balance, isSuccess } = useReadContract({
    abi: BootcampTokenABI,
    address: erc20ContractAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [userAddress ?? '0x0'],
    query: {
      enabled: Boolean(userAddress),
    },
  });

  // Function to validate Ethereum addresses
  const isValidAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address);

  // Async function to handle token transfer
  async function submitTransferErc20(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userAddress) {
      setErrorMessage('You must connect your wallet...');
      return;
    }

    // Check if the address is valid
    if (!isValidAddress(toAddress)) {
      setErrorMessage('Improper address type');
      return;
    }

    // Check if the user has sufficient funds
    const amountToSend = parseFloat(tokenAmount);
    const tokenBalance = parseFloat(formatEther(erc20Balance?.toString() || '0'));
    if (tokenBalance <= amountToSend + 0.001) {
      setErrorMessage('Insufficient funds');
      return;
    }

    // Clear any previous error messages
    setErrorMessage('');

    // Send the transaction
    sendTransaction({
      to: toAddress as `0x${string}`,
      value: parseEther(tokenAmount),
      chainId: chainId,
    });
  }

  // Function to reset the form and clear error messages
  function resetForm() {
    setToAddress('');
    setTokenAmount('');
    setErrorMessage('');
  }

  // useEffect to set isMounted state to true when the component mounts
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  // Return the UI components
  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        <Button>Send ERC20</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Send ERC20</DialogTitle>
          <DialogDescription>
            The amount entered will be sent to the address once you hit the Send button
          </DialogDescription>
        </DialogHeader>
        {isMounted ? (
          <div className="w-full">
            <form className="flex flex-col w-full gap-y-2" onSubmit={submitTransferErc20}>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  name="address"
                  placeholder="0xA0Cf…251e"
                  required
                  value={toAddress}
                  onChange={(event) => setToAddress(event.target.value)}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="value">Amount</Label>
                <Input
                  name="value"
                  placeholder="0.05"
                  required
                  value={tokenAmount}
                  onChange={(event) => setTokenAmount(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-x-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Confirming...' : 'Send'}
                </Button>
                <Button type="button" onClick={resetForm}>
                  <RefreshCw className="h-4 w-4" /> {/* Add the refresh icon */}
                </Button>
              </div>
              {errorMessage && (
                <div className="text-red-500 mt-2">
                  {errorMessage}
                </div>
              )}
            </form>
            {hash && (
              <div className="pt-8 flex flex-col items-center">
                <Link
                  className={`flex items-center gap-x-1.5 ${isTransactionConfirmed ? 'text-blue-500' : 'text-gray-500'}`}
                  href={getExplorerLink(hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View tx on explorer <ExternalLinkIcon className="h-4 w-4" />
                </Link>
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isTransactionConfirmed && <div>Transaction confirmed.</div>}
              </div>
            )}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
