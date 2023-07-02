import { useEffect, ChangeEvent } from "react";
import useTranslation from "next-translate/useTranslation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAddRelayerContext } from "../../../hooks/useAddRelayerContext";
import { useRelayers } from "../../../hooks/useRelayers";
import { useDebounce } from "../../../hooks/useDebounce";

import { Dialog } from "@headlessui/react";
import { Warning } from "./Warning";
import { Confirm } from "./Confirm";
import { Button } from "../../Button";

interface Props {
  closeModal?: Function;
}

const AddRelayerSchema = z.object({
  name: z.string().min(3).max(20),
  existingRelayer: z.string().refine((value) => {
    // if existingRelayer is "true", return false to fail validation.
    return value === "true" ? false : true;
  }, "relayer-name-taken"),
});

type AddRelayerSchemaType = z.infer<typeof AddRelayerSchema>;

const Form = (props: Props) => {
  const { t } = useTranslation("common");
  const context = useAddRelayerContext();
  if (!context) {
    // Handle the case when context is undefined
    return null;
  }

  const {
    initialize,
    title,
    step,
    setStep,
    setData,
    isAddRelayerPrepareLoading,
    addRelayer,
    addRelayerError,
    isAddRelayerLoading,
    isAddRelayerSuccess,
    txLoading,
    txSuccess,
    txError,
  } = context;

  const {
    register,
    formState: { errors, isValid },
    trigger,
    setValue,
    getValues,
    watch,
  } = useForm<AddRelayerSchemaType>({
    defaultValues: {
      name: "",
      existingRelayer: "false",
    },
    resolver: zodResolver(AddRelayerSchema),
    mode: "onChange", // Enable validation on every change
  });

  // The following allows us to validate the new relayer name
  // on the client side against values stored in the subgraph.
  const nameValue = watch("name");
  const { relayers } = useRelayers({
    pageSize: 1,
    skip: 0,
    filter: { name: nameValue },
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const debouncedRelayers = useDebounce(relayers, 200);

  useEffect(() => {
    // I wasn't able to run a query for existing relayers in the zod validation
    // so I'm instead watching the name field, re-running the query on each
    // key stroke, and if an existing relayer is found, I set the value
    // on a hidden field to "true", and use zod to validate that form field.
    // ie. if the value of existingRelayer == "true", fail form validation
    // and notify user.
    if (debouncedRelayers && debouncedRelayers.length > 0) {
      setValue("existingRelayer", "true");
    } else {
      setValue("existingRelayer", "false");
    }
    trigger("existingRelayer");
  }, [nameValue, setValue, trigger, debouncedRelayers]);

  const handleClose = () => {
    if (props.closeModal) {
      props.closeModal();
      initialize();
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
    initialize();
  };

  const handleNext = () => {
    if (isValid) {
      setData((prevData) => ({
        ...prevData,
        ["name"]: getValues("name"),
      }));

      setStep((prev) => prev + 1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (isValid) {
        const name = event.currentTarget.name;
        const value = event.currentTarget.value;
        setData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
        setStep((prev) => prev + 1);
      }
    }
  };

  const content = (
    <form className="form form-control w-full">
      <Dialog.Title
        as="h3"
        className="text-center text-xl font-bold leading-6 text-gray-900"
      >
        {title[step]}
      </Dialog.Title>
      {(step == 1 || step == 2) && <Warning />}
      {step == 3 && (
        <div className="w-full mt-6">
          <div className="grid">
            <input
              placeholder="Relayer name"
              {...register("name")}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              type="search"
              className={`${
                errors && (errors.name || errors.existingRelayer)
                  ? "input input-error"
                  : "input"
              } input-bordered w-full max-w-xs1`}
            />
            <input
              placeholder="Relayer hidden"
              {...register("existingRelayer")}
              type="hidden"
            />
            <label className="label">
              <ul>
                {errors.name && (
                  <li className="label-text-alt text-error text-sm">
                    {errors.name.message}
                  </li>
                )}
                {errors.existingRelayer && (
                  <li className="label-text-alt text-error text-sm">
                    {errors.existingRelayer.message}
                  </li>
                )}
              </ul>
            </label>
          </div>
        </div>
      )}
      {step == 4 && <Confirm />}

      {
        // Error block
        ((addRelayerError && addRelayerError.message) ||
          (txError && txError.message)) && (
          <details className="collapse collapse-arrow">
            <summary className="collapse-title text-error collapse-arrow">
              Transaction error
            </summary>
            <div className="collapse-content text-error">
              <p>Error: {(addRelayerError || txError)?.message}</p>
            </div>
          </details>
        )
      }

      {
        // Buttons Block
        <div className="grid grid-flow-col justify-stretch gap-2 mt-4">
          {(step == 1 || step == 2 || step == 3) && (
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step == 3 && (
            <Button type="button" onClick={handleNext} disabled={!isValid}>
              Save
            </Button>
          )}

          {step == 4 && (
            // isAddRelayerLoading,
            // isAddRelayerSuccess,
            // txSuccess,
            <>
              <Button
                type="button"
                onClick={handlePrev}
                className={`${isAddRelayerSuccess ? "hidden" : ""}`}
              >
                Back
              </Button>
              <Button
                type="button"
                disabled={!addRelayer || isAddRelayerLoading}
                data-addRelayer-loading={isAddRelayerLoading}
                data-addRelayer-started={isAddRelayerSuccess}
                onClick={() => {
                  isAddRelayerSuccess ? handleClose() : addRelayer?.();
                }}
                className="flex align-middle items-center gap-2"
              >
                {!isAddRelayerLoading &&
                  !isAddRelayerSuccess &&
                  t("open-wallet")}
                {(isAddRelayerPrepareLoading || isAddRelayerLoading) && (
                  <>
                    <span className="loading loading-spinner mr-2 bg-white"></span>
                    <span className="text-gray-500">
                      {t("waiting-for-wallet")}
                    </span>
                  </>
                )}
                {isAddRelayerSuccess && t("close")}
              </Button>
              {txLoading && "Transaction loading"}
              {txSuccess && "Transaction complete"}
            </>
          )}
        </div>
        // End buttons block
      }
    </form>
  );
  return content;
};
export default Form;
