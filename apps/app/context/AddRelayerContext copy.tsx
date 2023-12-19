import React, { useEffect } from "react";
import { createContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

import { fetchHasTags } from "../services/tokenService";
import { addRelayer as addRelayerService } from "../services/relayerService";
import { TransactionReceipt } from "viem";

import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { WriteContractResult } from "@wagmi/core";

import { etsRelayerFactoryContractConfig } from "../contract.config";

type Data = {
  name: string;
  existingRelayer: string;
};

export type FormContextValue = {
  initialize: () => void;
  hasTags: boolean;
  isAddRelayerPrepareLoading: boolean;
  addRelayer: (() => void) | undefined;
  addRelayerError: Error | null;
  addRelayerData: WriteContractResult | undefined;
  isAddRelayerLoading: boolean;
  isAddRelayerSuccess: boolean;
  txSuccess: boolean;
  txError: Error | null;
  txLoading: boolean;
  title: { [key: number]: string };
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  data: Data;
  setData: Dispatch<SetStateAction<Data>>;
};

export const AddRelayerContext = createContext<FormContextValue | undefined>(undefined);

export const AddRelayerProvider = ({ children }: { children: React.ReactNode }) => {
  // Define title states.
  // TODO: Translate
  const title = {
    1: "Create Relayer",
    2: "Create Relayer",
    3: "Create Relayer",
    4: "Confirm Details",
    5: "Transaction Sent",
    6: "Transaction Complete",
  };

  const [data, setData] = useState({
    name: "",
    existingRelayer: "",
  });

  const { address, isConnected } = useAccount();
  //const [currentAuctionId, setCurrentAuctionId] = useState<number>(0);
  const [hasTags, setHasTags] = useState<boolean>(false);

  // Default step to login required.
  const [step, setStep] = useState(1);
  const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAddRelayer = async () => {
    setIsLoading(true);
    try {
      const receipt = await addRelayerService(data.name);
      setTransactionReceipt(receipt);
      // Update steps or handle success accordingly
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        // Handle the case where the error is not an instance of Error
        setError(new Error("An unknown error occurred"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const {
    config: addRelayerConfig,
    isLoading: isAddRelayerPrepareLoading,
    //error: addRelayerPrepareError,
  } = usePrepareContractWrite({
    ...etsRelayerFactoryContractConfig,
    functionName: "addRelayer",
    args: [data.name],
    enabled: step == 4 && data.name != "",
    onSuccess(data) {
      console.log("usePrepareContractWrite Success", data);
    },
    onError(err) {
      console.log("usePrepareContractWrite Error", err);
    },
  });

  const {
    data: addRelayerData,
    write: addRelayer,
    error: addRelayerError,
    isLoading: isAddRelayerLoading, // Waiting for wallet action
    isSuccess: isAddRelayerSuccess, // Wallet txn submitted
    reset: resetAddRelayer,
  } = useContractWrite({
    ...addRelayerConfig,
    onSuccess(data) {
      setStep(5);
    },
  });

  const {
    isLoading: txLoading,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: addRelayerData?.hash,
    onSuccess(data) {
      setStep(6);
    },
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        // Initialize some data
        const hasTagsData = await fetchHasTags(address);
        setHasTags(hasTagsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [address, isConnected, hasTags, setStep]);

  const initialize = () => {
    if (address && isConnected) {
      resetAddRelayer();
      if (!hasTags) {
        setStep(2);
      } else {
        setStep(3);
      }
    } else {
      setStep(1);
    }
  };

  useEffect(() => initialize(), [address, isConnected, hasTags]);

  const contextValue: FormContextValue = {
    initialize,
    hasTags,
    isAddRelayerPrepareLoading,
    addRelayer,
    addRelayerError,
    addRelayerData,
    isAddRelayerLoading,
    isAddRelayerSuccess,
    txLoading,
    txSuccess,
    txError,
    title,
    step,
    setStep,
    data,
    setData,
  };

  return <AddRelayerContext.Provider value={contextValue}>{children}</AddRelayerContext.Provider>;
};
