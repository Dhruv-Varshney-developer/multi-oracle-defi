import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import CUSDABI from "../utils/CUSDabi.json";
import LendingBorrowingABI from "../utils/LendingBorrowingabi.json";

export const useContractActions = (
  lendingContractAddress,
  CUSDContractAddress
) => {
  const {
    writeContract,
    data: writeTxData,
    isLoading: isWriteLoading,
    error,
  } = useWriteContract();

  const { isLoading: isTxLoading } = useWaitForTransactionReceipt({
    hash: writeTxData?.hash,
  });

  const handleAction = async (action, amount) => {
    if (!amount) return;

    try {
      const actions = {
        borrow: {
          address: lendingContractAddress,
          abi: LendingBorrowingABI,
          functionName: "borrow",
          args: [parseEther(amount)],
        },
        repay: {
          address: lendingContractAddress,
          abi: LendingBorrowingABI,
          functionName: "repay",
          args: [parseEther(amount)],
        },
        withdraw: {
          address: lendingContractAddress,
          abi: LendingBorrowingABI,
          functionName: "withdrawCollateral",
          args: [parseEther(amount)],
        },
        deposit: {
          address: lendingContractAddress,
          abi: LendingBorrowingABI,
          functionName: "depositCollateral",
          value: parseEther(amount),
        },
        buy: {
          address: CUSDContractAddress,
          abi: CUSDABI,
          functionName: "buy",
          value: parseEther(amount),
        },
      };

      await writeContract(actions[action]);
    } catch (error) {
      console.error(`${action} error:`, error);
    }
  };

  const handleApprove = async (amount) => {
    try {
      await writeContract({
        address: CUSDContractAddress,
        abi: CUSDABI,
        functionName: "approve",
        args: [lendingContractAddress, parseEther(amount)],
      });
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  return {
    handleAction,
    handleApprove,
    writeTxData,
    isWriteLoading,
    isTxLoading,
    error,
  };
};
