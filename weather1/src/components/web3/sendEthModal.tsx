import { useEffect, useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Link from 'next/link';
import { ExternalLinkIcon, RefreshCw } from 'lucide-react';

// Define the SendEthModal component, accepting userAddress, userBalance, and chainId as props
export default function SendEthModal({ userAddress, userBalance, chainId }: { userAddress: string, userBalance: string, chainId: number }) {
  // State variables for the address to send to, the value to send, and whether the component is mounted
  const [toAddress, setToAddress] = useState<string>('');
  const [ethValue, setEthValue] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Hooks to manage sending transactions and waiting for transaction receipts
  const { data: hash, isPending, sendTransaction } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Function to validate Ethereum addresses
  const isValidAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address);

  // Function to handle the form submission
  async function submitSendTx(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Check if the address is valid
    if (!isValidAddress(toAddress)) {
      setErrorMessage('Improper address type');
      return;
    }

    // Check if the user has sufficient funds
    const amountToSend = parseFloat(ethValue);
    if (parseFloat(userBalance) <= amountToSend + 0.001) {
      setErrorMessage('Insufficient funds');
      return;
    }

    // Clear any previous error messages
    setErrorMessage('');

    // Send the transaction
    sendTransaction({
      to: toAddress as `0x${string}`,
      value: parseEther(ethValue),
      chainId: chainId
    });
  }

  // Function to reset the form and clear error messages
  function resetForm() {
    setToAddress('');
    setEthValue('');
    setErrorMessage('');
  }

  // useEffect hook to set isMounted state to true when the component mounts
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  // Function to generate the transaction explorer link based on the chain ID
  const getExplorerLink = (hash: string) => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return `https://etherscan.io/tx/${hash}`;
      case 137: // Polygon Mainnet
        return `https://polygonscan.com/tx/${hash}`;
      case 80001: // Mumbai Testnet
        return `https://mumbai.polygonscan.com/tx/${hash}`;
      default:
        return `https://etherscan.io/tx/${hash}`;
    }
  };

  // Return the UI components
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Send ETH</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Send ETH</DialogTitle>
          <DialogDescription>
            The amount entered will be sent to the address once you hit the Send button
          </DialogDescription>
        </DialogHeader>
        {isMounted ? (
          <div className="w-full">
            <form
              className="flex flex-col w-full gap-y-2"
              onSubmit={submitSendTx}
            >
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
                  value={ethValue}
                  onChange={(event) => setEthValue(event.target.value)}
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
                  className="hover:text-accent flex items-center gap-x-1.5"
                  href={getExplorerLink(hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View tx on explorer <ExternalLinkIcon className="h4 w-4" />
                </Link>
                {isConfirming && <div>Waiting for confirmation...</div>}
                {isConfirmed && <div>Transaction confirmed.</div>}
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
