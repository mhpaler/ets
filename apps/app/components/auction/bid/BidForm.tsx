import React, { useState, useEffect } from "react";
import useTranslation from "next-translate/useTranslation";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";

import { formatEther } from "ethers/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Dialog } from "@headlessui/react";
import { Button } from "@app/components/Button";
import { Alert } from "@app/components/icons";

interface FormStepProps {
  closeModal: () => void;
  goToNextStep: () => void;
}

const BidForm: React.FC<FormStepProps> = ({ closeModal, goToNextStep }) => {
  //const BidForm = () => {
  const { t } = useTranslation("common");
  const auctionContext = useAuctionHouse();
  const { minIncrementBidPercentage, onDisplayAuction, bidFormData, setBidFormData } = auctionContext;
  const [isFormDisabled, setIsFormDisabled] = useState(true);
  const [parsedMinimumBidIncrement, setParsedMinimumBidIncrement] = useState<number>(0);

  // Effect to control form submit button's enabled/disabled state.
  useEffect(() => {
    if (!onDisplayAuction) return;

    // Assuming onDisplayAuction.amount is in Wei and needs conversion
    const reservePrice = formatEther(onDisplayAuction.reservePrice);
    const currentBid: bigint = onDisplayAuction.amount;

    // Assuming minIncrementBidPercentage is a percentage value like 5 for 5%
    // Convert the percentage into a scale factor for bigint calculation
    const scaleFactor: bigint = BigInt(100); // Scale factor to allow for "decimal" operations in bigint
    const percentageFactor: bigint = BigInt(minIncrementBidPercentage); // Convert percentage to bigint
    const minimumBidIncrement: string = formatEther(currentBid + (currentBid * percentageFactor) / scaleFactor);
    setParsedMinimumBidIncrement(
      onDisplayAuction.startTime === 0 ? parseFloat(reservePrice) : parseFloat(minimumBidIncrement),
    );
  }, [onDisplayAuction, minIncrementBidPercentage]);

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

  // Effect to control form submit button's enabled/disabled state.
  useEffect(() => {
    if (bidValue === undefined || errors.bid) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
  }, [bidValue, errors.bid]);

  // Handler for form submission.
  const onSubmit: SubmitHandler<BidFormData> = (bidFormData) => {
    if (!isFormDisabled) {
      // Update context data and move to the next step.
      setBidFormData({ bid: bidFormData.bid });
      goToNextStep();
      console.log("onSubmitHandler called, setBidFormData: ", bidFormData);
      //goToNextStep();
    }
  };

  // Function to handle the "Cancel" action.
  const handleCancel = () => {
    reset();
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
                {t("AUCTION.BID_PLACEHOLDER", { minimumBid: parsedMinimumBidIncrement })}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-flow-col justify-stretch gap-2 mt-4">
          <Button type="button" onClick={handleCancel}>
            {t("FORM.BUTTON.CANCEL")}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isFormDisabled}
            type="button"
            className={`${!isFormDisabled ? "btn-primary btn-outline" : ""}`}
          >
            {t("FORM.BUTTON.NEXT")}
          </Button>
        </div>
      </form>
    </>
  );
};

export { BidForm };
