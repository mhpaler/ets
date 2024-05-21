import React, { useState, useEffect } from "react";
import useTranslation from "next-translate/useTranslation";
import { formatEther } from "ethers/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useModal } from "@app/hooks/useModalContext";
import { useTransactionManager } from "@app/hooks/useTransactionManager";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useAuction } from "@app/hooks/useAuctionContext";
import { useCurrentChain } from "@app/hooks/useCurrentChain";

import { Dialog } from "@headlessui/react";
import { Alert } from "@app/components/icons";
import TransactionFormActions from "@app/components/transaction/shared/TransactionFormActions";

interface BidInputProps {
  transactionId: string;
  goToNextStep: () => void;
}

const BidInput: React.FC<BidInputProps> = ({ transactionId, goToNextStep }) => {
  const { t } = useTranslation("common");
  const { closeModal } = useModal();
  const { removeTransaction } = useTransactionManager();
  const { minIncrementBidPercentage } = useAuctionHouse();
  const { auction, bidFormData, setBidFormData } = useAuction();
  const chain = useCurrentChain();

  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [parsedMinimumBidIncrement, setParsedMinimumBidIncrement] = useState<number>(0);

  // Define Zod schema inside component to access dynamic minimum bid increment
  const bidValidationSchema = z.object({
    bid: z.union([
      z
        .number()
        .min(parsedMinimumBidIncrement, t("AUCTION.BID_PLACEHOLDER", { minimumBid: parsedMinimumBidIncrement })),
      z.undefined(), // Allow bid to be undefined
    ]),
  });

  type BidFormData = z.infer<typeof bidValidationSchema>;

  // Initialize form handling using react-hook-form with Zod for schema validation.
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(bidValidationSchema),
    mode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: {
      bid: bidFormData.bid, // Keep bid as undefined initially for UX purposes
    },
  });

  // Watch the 'name' input field for changes and debounce the input value.
  const bidValue = watch("bid", undefined);

  useEffect(() => {
    setBidFormData({ bid: undefined });
  }, [setBidFormData]);

  // Effect to set min bid increment.
  useEffect(() => {
    if (!auction) return;

    // Assuming auction.amount is in Wei and needs conversion
    const reservePrice = formatEther(auction.reservePrice);
    const currentBid: bigint = auction.amount;

    // Assuming minIncrementBidPercentage is a percentage value like 5 for 5%
    // Convert the percentage into a scale factor for bigint calculation
    const scaleFactor: bigint = BigInt(100); // Scale factor to allow for "decimal" operations in bigint
    const percentageFactor: bigint = BigInt(minIncrementBidPercentage); // Convert percentage to bigint
    const minimumBidIncrement: string = formatEther(currentBid + (currentBid * percentageFactor) / scaleFactor);

    setParsedMinimumBidIncrement(auction.startTime === 0 ? parseFloat(reservePrice) : parseFloat(minimumBidIncrement));
  }, [auction, minIncrementBidPercentage]);

  // Use the zod validation schema directly to check validity.
  useEffect(() => {
    // Convert the watched bidValue to the expected form data format for validation.
    const formDataToValidate = { bid: bidValue };

    // Directly use the zod schema to check for validity.
    const validationResult = bidValidationSchema.safeParse(formDataToValidate);

    // Set form disabled state based on validation result.
    // If validation fails or bidValue is undefined, keep the button disabled.
    setIsFormDisabled(!validationResult.success || bidValue === undefined);
  }, [bidValue, bidValidationSchema]);

  // Handler for form submission.
  const onSubmit: SubmitHandler<BidFormData> = (bidFormData) => {
    if (!isFormDisabled) {
      // Update context data and move to the next step.
      setBidFormData({ bid: bidFormData.bid });
      goToNextStep();
    }
  };

  // Function to handle the "Cancel" action.
  const handleCancel = () => {
    reset();
    removeTransaction(transactionId);
    setBidFormData({ bid: undefined });
    if (closeModal) {
      closeModal();
    }
  };

  // Function to handle the "Cancel" action

  return (
    <>
      <Dialog.Title as="h3" className="mb-8 text-xl font-bold leading-6 text-gray-900">
        {t("AUCTION.PLACE_YOUR_BID")}
      </Dialog.Title>

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-control w-full">
          <div className="label">
            <span className="label-text">{t("AUCTION.YOUR_MAX_BID")}</span>
          </div>

          <label className="input input-bordered flex items-center gap-2">
            <input
              autoComplete="off"
              id="bid"
              {...register("bid", {
                setValueAs: (value) => parseFloat(value) || 0, // Ensure bid is always treated as a number
              })}
              className="grow"
            />
            <span className="badge font-bold">{chain?.nativeCurrency.symbol}</span>
            {errors.bid && (
              <span className="text-error">
                <Alert />
              </span>
            )}
          </label>

          <div className="label">
            {errors.bid ? (
              <span className="label-text error-message text-error">{errors.bid.message}</span>
            ) : (
              <span className="label-text default-text">
                {t("AUCTION.BID_PLACEHOLDER_BEFORE")}
                <button
                  type="button"
                  className="text-primary"
                  onClick={() => setValue("bid", parsedMinimumBidIncrement)}
                >
                  &nbsp;{parsedMinimumBidIncrement}
                </button>
                &nbsp;{chain?.nativeCurrency.symbol}&nbsp;
                {t("AUCTION.BID_PLACEHOLDER_AFTER")}
              </span>
            )}
          </div>
        </div>
        <TransactionFormActions
          isFormDisabled={isFormDisabled}
          handleCancel={handleCancel}
          handleSubmit={handleSubmit(onSubmit)}
        />
      </form>
    </>
  );
};

export { BidInput };
