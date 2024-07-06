import { useEffect, useState } from 'react';
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
import { useTransactionHelper } from './web3helpers/transactionHelper'; // Import the helper function

export default function SendEthModal({ userAddress, userBalance, chainId }: { userAddress: string, userBalance: string, chainId: number }) {
  const [toAddress, setToAddress] = useState<string>('');
  const [ethValue, setEthValue] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Use the helper function for transaction logic
  const { hash, isPending, isConfirming, isTransactionConfirmed, sendTransaction, getExplorerLink } = useTransactionHelper({ chainId });

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
      chainId: chainId,
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
