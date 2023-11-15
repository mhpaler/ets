import React, { useEffect } from "react";
import {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { WriteContractResult } from "@wagmi/core";

//import { useDebounce } from "../../../hooks/useDebounce";
import config from "../abi/config.json";
import ETSTokenABI from "../abi/contracts/ETSToken.sol/ETSToken.json";
import ETSRelayerFactoryABI from "../abi/contracts/ETSRelayerFactory.sol/ETSRelayerFactory.json";

const etsTokenContractConfig = {
  address: config[31337].contracts.ETSToken.address as `0x${string}`,
  abi: ETSTokenABI,
} as const;

const etsRelayerFactoryContractConfig = {
  address: config[31337].contracts.ETSRelayerFactory.address as `0x${string}`,
  abi: ETSRelayerFactoryABI,
} as const;

type Data = {
  name: string;
  existingRelayer: string;
};

export type FormContextValue = {
  initialize: () => void;
  address: `0x${string}` | undefined;
  isConnected: boolean;
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

const AddRelayerContext = createContext<FormContextValue | undefined>(
  undefined
);

export const AddRelayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  const [hasTags, setHasTags] = useState(false);

  // Default step to login required.
  const [step, setStep] = useState(1);

  // Get current user balance of CTAGs
  const {} = useContractRead({
    ...etsTokenContractConfig,
    functionName: "balanceOf",
    args: [address],
    enabled: address ? true : false,
    onSuccess(data: bigint) {
      console.log("balanceOf: ", data);
      if (data > BigInt(0)) {
        console.log("useContractRead user has tags");
        setHasTags(true);
      } else {
        setHasTags(false);
        console.log("useContractRead user has no tags");
      }
    },
  });

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
    address,
    isConnected,
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

  return (
    <AddRelayerContext.Provider value={contextValue}>
      {children}
    </AddRelayerContext.Provider>
  );
};

export { AddRelayerContext };
