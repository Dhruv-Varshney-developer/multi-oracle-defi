import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther} from 'viem';
import { motion } from 'framer-motion';
import LendingBorrowingABI from '../utils/LendingBorrowingabi.json';
import SimpleUSDTokenABI from '../utils/SimpleUSDTokenABI.json';

// StatCard Component
const StatCard = ({ title, value, icon }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="bg-white/10 backdrop-blur-lg rounded-xl p-4 flex flex-col items-center justify-center space-y-2"
  >
    <div className="text-blue-400">{icon}</div>
    <h3 className="text-sm text-gray-400">{title}</h3>
    <p className="text-lg font-bold text-white">{value}</p>
  </motion.div>
);

// ActionCard Component
const ActionCard = ({ title, children, icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/5 backdrop-blur-lg rounded-xl p-6 space-y-4"
  >
    <div className="flex items-center space-x-2">
      <span className="text-blue-400">{icon}</span>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
);

// Input Component
const Input = ({ label, value, onChange, type = "number", placeholder }) => (
  <div className="space-y-2">
    <label className="text-sm text-gray-400">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// Button Component
const Button = ({ onClick, disabled, children, loading, variant = "primary" }) => {
  const baseStyles = "w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800 disabled:opacity-50",
    secondary: "bg-white/10 hover:bg-white/20 text-white disabled:opacity-50",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};

// Main Component
const LendingBorrowing = () => {
  const { address } = useAccount();
  const [collateralETH, setCollateralETH] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [activeTab, setActiveTab] = useState("deposit");

  const lendingContractAddress = "0xE18C1Bc5316e8590A93fC9dD8A338A0019068075";
  const susdContractAddress = "0xdCe92E3F9Bd38776cfaEF9d7B6fA551f274D9323";

  // Contract reads
  const { data: ethPrice } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "getLatestPrice",
  });

  const { data: maxBorrow } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "getMaxBorrowAmount",
  });

  const { data: userData } = useReadContract({
    address: lendingContractAddress,
    abi: LendingBorrowingABI,
    functionName: "users",
    args: [address],
  });

  const { data: contractSUSDBalance } = useReadContract({
    address: susdContractAddress,
    abi: SimpleUSDTokenABI,
    functionName: "balanceOf",
    args: [lendingContractAddress],
  });

  const { data: userSUSDBalance } = useReadContract({
    address: susdContractAddress,
    abi: SimpleUSDTokenABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: contractETHBalance } = useBalance({
    address: lendingContractAddress,
  });

  // Contract writes
  const { writeContract, data: writeTxData, isLoading: isWriteLoading } = useWriteContract();

  // Transaction receipts
  const { isLoading: isTxLoading, data: txReceipt } = useWaitForTransactionReceipt({
    hash: writeTxData?.hash,
  });

  // Action handlers
  const handleDeposit = async () => {
    if (!collateralETH) return;

    try {
      await writeContract({
        address: lendingContractAddress,
        abi: LendingBorrowingABI,
        functionName: "depositCollateral",
        value: parseEther(collateralETH),
      });
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmount) return;

    try {
      await writeContract({
        address: lendingContractAddress,
        abi: LendingBorrowingABI,
        functionName: "borrow",
        args: [borrowAmount],
      });
    } catch (error) {
      console.error("Borrow error:", error);
    }
  };

  const handleRepay = async () => {
    if (!repayAmount) return;

    try {
      await writeContract({
        address: lendingContractAddress,
        abi: LendingBorrowingABI,
        functionName: "repay",
        args: [repayAmount],
      });
    } catch (error) {
      console.error("Repay error:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;

    try {
      await writeContract({
        address: lendingContractAddress,
        abi: LendingBorrowingABI,
        functionName: "withdrawCollateral",
        args: [parseEther(withdrawAmount)],
      });
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  const handleApprove = async () => {
    try {
      await writeContract({
        address: susdContractAddress,
        abi: SimpleUSDTokenABI,
        functionName: "approve",
        args: [lendingContractAddress, 1000000],
      });
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold">Lending & Borrowing Protocol</h1>
          <p className="text-gray-400">Deposit ETH, Borrow SUSD, and more!</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="ETH Price" 
            value={ethPrice ? `$${Number(ethPrice)/10**8}` : "Loading..."} 
            icon="💎"
          />
          <StatCard 
            title="Your Collateral" 
            value={userData ? `${Number(userData[0])} ETH` : "0 ETH"} 
            icon="🏦"
          />
          <StatCard 
            title="Your SUSD Balance" 
            value={userSUSDBalance ? `${Number(userSUSDBalance)} SUSD` : "0 SUSD"} 
            icon="💵"
          />
          <StatCard 
            title="Borrowed Amount" 
            value={userData ? `${Number(userData[1])} SUSD` : "0 SUSD"} 
            icon="🏦"
          />
        </div>

        {/* Protocol Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Protocol ETH Balance" 
            value={contractETHBalance ? `${Number(contractETHBalance.value)} ETH` : "Loading..."} 
            icon="🏦"
          />
          <StatCard 
            title="Protocol SUSD Balance" 
            value={contractSUSDBalance ? `${Number(contractSUSDBalance)} SUSD` : "Loading..."} 
            icon="💰"
          />
          <StatCard 
            title="Max Borrowable SUSD Amount" 
            value={maxBorrow ? `${Number(maxBorrow)} SUSD` : "Loading..."} 
            icon="📊"
          />
        </div>

        {/* Action Tabs */}
        <div className="flex space-x-4 justify-center">
          {["deposit", "borrow", "repay", "withdraw"].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab 
                  ? "bg-blue-600 text-white" 
                  : "bg-white/10 text-gray-300"
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Action Cards */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "deposit" && (
            <ActionCard title="Deposit Collateral" icon="🏦">
              <Input
                label="Amount (ETH)"
                value={collateralETH}
                onChange={(e) => setCollateralETH(e.target.value)}
                placeholder="0"
              />
              <Button onClick={handleDeposit} loading={isTxLoading}>
                Deposit ETH
              </Button>
            </ActionCard>
          )}

          {activeTab === "borrow" && (
            <ActionCard title="Borrow SUSD" icon="💸">
              <Input
                label="Amount (SUSD)"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                placeholder="0.0"
              />
              <Button onClick={handleBorrow} loading={isTxLoading}>
                Borrow SUSD
              </Button>
            </ActionCard>
          )}

          {activeTab === "repay" && (
            <ActionCard title="Repay Loan" icon="💰">
              <Input
                label="Amount (SUSD)"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="0.0"
              />
              <div className="space-y-2">
                <Button onClick={handleApprove} variant="secondary">
                  Approve SUSD
                </Button>
                <Button onClick={handleRepay} loading={isTxLoading}>
                  Repay SUSD
                </Button>
              </div>
            </ActionCard>
          )}

          {activeTab === "withdraw" && (
            <ActionCard title="Withdraw Collateral" icon="📤">
              <Input
                label="Amount (ETH)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.0"
              />
              <Button onClick={handleWithdraw} loading={isTxLoading}>
                Withdraw ETH
              </Button>
            </ActionCard>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LendingBorrowing;