import React from "react";
import { useEffect, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { useDebounce } from "../../../hooks/useDebounce";
import config from "../../../abi/config.json";
import ETSTokenABI from "../../../abi/contracts/ETSToken.sol/ETSToken.json";
import ETSRelayerFactoryABI from "../../../abi/contracts/ETSRelayerFactory.sol/ETSRelayerFactory.json";

import { Button } from "../../Button";
import { RelayerSearch } from "./RelayerSearch";

const etsTokenContractConfig = {
  address: config[31337].contracts.ETSToken.address as `0x${string}`,
  abi: ETSTokenABI,
} as const;

const etsRelayerFactoryContractConfig = {
  address: config[31337].contracts.ETSRelayerFactory.address as `0x${string}`,
  abi: ETSRelayerFactoryABI,
} as const;

interface Props {
  closeModal?: Function;
}

const CreateRelayerModal = (props: Props) => {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);
  const [hasTags, setHasTags] = useState(false);

  const [relayerName, setRelayerName] = useState("");
  const debouncedRelayerName = useDebounce(relayerName, 500);

  const { address, isConnected } = useAccount();
  const { t } = useTranslation("common");

  const handleClick = () => {
    // Some logic...
    if (props.closeModal) {
      props.closeModal();
    }
  };

  const { config: addRelayerConfig, error: prepareError } =
    usePrepareContractWrite({
      ...etsRelayerFactoryContractConfig,
      functionName: "addRelayer",
      args: [debouncedRelayerName],
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
    isLoading: isAddRelayerLoading,
    isSuccess: isAddRelayerSuccess,
    error: addRelayerError,
  } = useContractWrite(addRelayerConfig);

  const { data: balanceOf, error: balanceOfError } = useContractRead({
    ...etsTokenContractConfig,
    functionName: "balanceOf",
    args: [address],
    enabled: address ? true : false,
    onSuccess(data: bigint) {
      if (data > BigInt(0)) {
        console.log("has tags");
      } else {
        console.log("has no tags");
      }
    },
  });

  const {
    //data: txData,
    isLoading: txLoading,
    isFetching: txFetching,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: addRelayerData?.hash,
  });

  //console.log("txLoading", txLoading);

  useEffect(() => {
    if (balanceOf) {
      setHasTags(true);
    }
  }, [balanceOf]);

  const relayerAdded = txSuccess;

  return (
    <div>
      {mounted && address ? (
        <div className="w-full mt-8">
          {mounted ? (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Pick a name for your relayer</span>
              </label>
              <input
                id="relayerName"
                aria-label="Relayer name"
                onChange={(e) => setRelayerName(e.target.value)} // update the recipient state on input change
                placeholder={`eg. "Mike's relayer"`}
                value={relayerName}
                className="input input-bordered w-full max-w-xs1"
              />
              <div className="flex justify-center min-h-[6rem] min-w-[18rem] max-w-4xl flex-wrap items-center gap-2 overflow-x-hidden p-4">
                {!txLoading && <Button onClick={handleClick}>Cancel</Button>}
                {mounted && isConnected && !relayerAdded && (
                  <Button
                    disabled={
                      !addRelayer || isAddRelayerLoading || isAddRelayerSuccess
                    }
                    data-addRelayer-loading={isAddRelayerLoading}
                    data-addRelayer-started={isAddRelayerSuccess}
                    onClick={() => addRelayer?.()}
                  >
                    {isAddRelayerLoading && (
                      <div className="flex align-middle items-center gap-2">
                        <span className="loading loading-spinner"></span>
                        {t("waiting-for-wallet")}
                      </div>
                    )}
                    {isAddRelayerSuccess && "Adding relayer..."}
                    {!isAddRelayerLoading &&
                      !isAddRelayerSuccess &&
                      "Add relayer"}
                  </Button>
                )}
              </div>
              {prepareError && (
                <p style={{ marginTop: 24, color: "#FF6257" }}>
                  Error: {prepareError.message}
                </p>
              )}
              {addRelayerError && (
                <p style={{ marginTop: 24, color: "#FF6257" }}>
                  Error: {addRelayerError.message}
                </p>
              )}
              {txError && (
                <p style={{ marginTop: 24, color: "#FF6257" }}>
                  Error: {txError.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p>You don't own a CTAG</p>
              <div className="mt-4">
                <Button onClick={handleClick}>Close</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="container flex flex-col  items-center mt-10">
          <div>Please login to create a relayer</div>
        </div>
      )}
    </div>
  );
};

export { CreateRelayerModal };
