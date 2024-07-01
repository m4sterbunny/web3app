'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Link from 'next/link';
import { ExternalLinkIcon } from 'lucide-react';

export default function SendEthModal() {
  const [toAddress, setToAddress] = useState('');
  const [ethValue, setEthValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { data: hash, isPending, sendTransaction } = useSendTransaction();
  const [insufficientFunds, setInsufficientFunds] = useState(false); // State to handle insufficient funds
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  const { address } = useAccount(); // Get user's account information
  const { data: balanceData } = useBalance({ address }); // Get user's balance

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function submitSendTx(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInsufficientFunds(false); // Reset insufficient funds state

    const balance = parseFloat(balanceData?.formatted || '0');
    const valueToSend = parseFloat(ethValue);

    if (valueToSend >= balance) {
      setInsufficientFunds(true); // Set insufficient funds state
      return;
    }

    sendTransaction({
      to: toAddress as `0x${string}`,
      value: parseEther(ethValue),
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
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
                  onChange={(event) => setToAddress(event.target.value)}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="value">Amount</Label>
                <Input
                  name="value"
                  placeholder="0.0005"
                  required
                  onChange={(event) => setEthValue(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Confirming...' : 'Send'}
              </Button>
              {insufficientFunds && (
                <p className="text-red-500">Insufficient funds</p> // Show insufficient funds message
              )}
            </form>
            {hash && (
              <div className="pt-8 flex flex-col items-center">
                <Link
                  className="hover:text-accent flex items-center gap-x-1.5"
                  href={`https://cardona-zkevm.polygonscan.com/tx/${hash}`}
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