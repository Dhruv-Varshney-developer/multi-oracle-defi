import CUSDABI from "../utils/CUSDabi.json";
import LendingBorrowingABI from "../utils/LendingBorrowingabi.json";
import { useAccount, useReadContract } from "wagmi";

export const useUserData = (lendingContractAddress, CUSDContractAddress) => {
  const { address } = useAccount();

  const { data: maxBorrow } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "getMaxBorrowAmount",
    account: address,
  });

  const { data: userData } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "users",
    args: [address],
  });

  const { data: userCUSDBalance } = useReadContract({
    address: CUSDContractAddress,
    abi: CUSDABI,
    functionName: "balanceOf",
    args: [address],
  });

  return {
    maxBorrow,
    userData,
    userCUSDBalance,
  };
};
