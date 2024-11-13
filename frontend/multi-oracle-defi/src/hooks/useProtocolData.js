import { useReadContract, useBalance } from "wagmi";
import CUSDABI from "../utils/CUSDabi.json";
import LendingBorrowingABI from "../utils/LendingBorrowingabi.json";

export const useProtocolData = (
  lendingContractAddress,
  CUSDContractAddress
) => {
  const { data: ethPrice } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "getLatestPrice",
  });

  const { data: contractCUSDBalance } = useReadContract({
    address: CUSDContractAddress,
    abi: CUSDABI,
    functionName: "balanceOf",
    args: [lendingContractAddress],
  });

  const { data: contractETHBalance } = useBalance({
    address: lendingContractAddress,
  });

  return {
    ethPrice,
    contractCUSDBalance,
    contractETHBalance,
  };
};
