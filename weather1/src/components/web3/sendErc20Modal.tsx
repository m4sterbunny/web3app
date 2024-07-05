'use client';

import { useEffect, useState } from 'react';
import { 
  useReadContract, 
  useWriteContract,
  useWaitForTransactionReceipt 
} from 'wagmi';
import { formatEther, parseEther } from 'viem'; // Added parseEther to import
import BootcampTokenABI from '../../lib/contracts/BootcampTokenABI';

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
import { RefreshCw } from 'lucide-react'; // Import the refresh icon

// Define the props expected by the component
type SendErc20ModalProps = {
  userAddress: `0x${string}` | undefined;
};

export default function SendErc20Modal({ userAddress }: SendErc20ModalProps) {
  // State variables to manage user input, component mounting, and claim status
  const [toAddress, setToAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const erc20ContractAddress = process.env.NEXT_PUBLIC_ERC20_CONTRACT_ADDRESS ?? '';
  const [isPendingClaim, setIsPendingClaim] = useState(false); // Corrected useState for isPendingClaim
  const [isPendingSend, setIsPendingSend] = useState(false); // Added useState for isPendingSend
  
  // Hook to manage contract write operations
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  
  // Hook to wait for the transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Hook to read the ERC20 balance of the user
  const { data: erc20Balance, isSuccess } = useReadContract({
    abi: BootcampTokenABI,
    address: erc20ContractAddress as `0x${string}`,
    functionName: 'balanceOf',
    // Use userAddress directly from props
    args: [userAddress ?? '0x0'], 
    query: {
      // Only query if userAddress is defined
      enabled: Boolean(userAddress), 
    },
  });

  // Function to validate Ethereum addresses
  const isValidAddress = (address: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(address);

  // Async function to handle token claiming
  async function handleClaimTokens(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    // Prevent the default form submission behavior
    e.preventDefault(); 
    if (!userAddress) {
      // Display a warning if userAddress is not available
      console.warn('You must connect your wallet...'); 
      return;
    }
    // Set the pending claim state to true
    setIsPendingClaim(true); 
    try {
      const hash = await writeContractAsync({
        abi: BootcampTokenABI,
        address: erc20ContractAddress as `0x${string}`,
        functionName: 'claim',
        args: [userAddress],
      });
    } catch (error) {
      // Log any errors that occur during the contract write operation
      console.error(error); 
    } finally {
      // Reset the pending claim state
      setIsPendingClaim(false); 
    }
  }

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
    const tokenBalance = parseFloat(formatEther(erc20Balance));
    if (tokenBalance <= amountToSend + 0.001) {
      setErrorMessage('Insufficient funds');
      return;
    }

    // Clear any previous error messages
    setErrorMessage('');

    setIsPendingSend(true);
    try {
      await writeContractAsync({
        abi: BootcampTokenABI,
        address: erc20ContractAddress as `0x${string}`,
        functionName: 'transfer',
        args: [toAddress as `0x${string}`, parseEther(tokenAmount)],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsPendingSend(false);
    }
  }

  // Function to reset the form and clear error messages
  function resetForm() {
    setToAddress('');
    setTokenAmount('');
    setErrorMessage('');
  }

  // UseEffect to set isMounted state to true when the component mounts
  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
    }
  }, [isMounted]);

  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        <Button className="w-auto">Send ERC20</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Send ERC20</DialogTitle>
          <DialogDescription>
            The amount entered will be sent to the address once you hit the Send
            button
          </DialogDescription>
        </DialogHeader>
        {isMounted ? ( // Render content only if the component is mounted
          <div className="w-full">
            <div className="text-center flex flex-col">
              {isSuccess ? ( // Check if the balance query was successful
                <>
                  <h2>{parseFloat(formatEther(erc20Balance)).toFixed(2)}</h2>
                  <h4>BOOTCAMP</h4>
                  {parseFloat(formatEther(erc20Balance)) === 0 && ( // Display claim button if balance is zero
                    <div className="w-full py-2">
                      <Button
                        onClick={handleClaimTokens}
                        variant="secondary"
                        disabled={isPending} // Disable button if a transaction is pending
                      >
                        {isPendingClaim ? 'Claiming...' : 'Claim'} // Show "Claiming..." while the claim is in progress
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p>Loading...</p> // Show loading text while balance is being fetched
              )}
            </div>
            <form
              className="flex flex-col w-full gap-y-2"
              onSubmit={submitTransferErc20}
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
                  value={tokenAmount}
                  onChange={(event) => setTokenAmount(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-x-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Confirming...' : 'Send'}
                </Button>
                <Button type="button" onClick={resetForm}>
                  <RefreshCw className="h-4 w-4" /> 
                  {/* Add the refresh icon */}
                </Button>
              </div>
              {errorMessage && (
                <div className="text-red-500 mt-2">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        ) : (
          <p>Loading...</p> 
          // Show loading text while component is mounting
        )}
      </DialogContent>
    </Dialog>
  );
}
