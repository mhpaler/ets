import React, { useState, useEffect } from "react";

import useTranslation from "next-translate/useTranslation";
import { useAuctionHouse } from "@app/hooks/useAuctionHouse";
import { useDebounce } from "@app/hooks/useDebounce";
import { formatEther } from "ethers/lib/utils";

import { Button } from "@app/components/Button";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Infer the type for form data from the Zod schema.

const BidForm = () => {
  const { t } = useTranslation("common");
  const context = useAuctionHouse();
  const { minIncrementBidPercentage, onDisplayAuction, bidFormData, setBidFormData } = context;

  // Early return if onDisplayAuction is null, rendering an alternative UI or null
  if (!onDisplayAuction) {
    return; // or return null if you prefer not to render anything
  }

  const [isFormDisabled, setIsFormDisabled] = useState(true);

  // Assuming onDisplayAuction.amount is in Wei and needs conversion
  const reservePrice = formatEther(onDisplayAuction.reservePrice);
  const currentBid: bigint = onDisplayAuction.amount;

  // Assuming minIncrementBidPercentage is a percentage value like 5 for 5%
  // Convert the percentage into a scale factor for bigint calculation
  const scaleFactor: bigint = BigInt(100); // Scale factor to allow for "decimal" operations in bigint
  const percentageFactor: bigint = BigInt(minIncrementBidPercentage); // Convert percentage to bigint
  const minimumBidIncrement: string = formatEther(currentBid + (currentBid * percentageFactor) / scaleFactor);
  const parsedMinimumBidIncrement =
    onDisplayAuction.startTime === 0 ? parseFloat(reservePrice) : parseFloat(minimumBidIncrement);

  // Define Zod schema inside component to access dynamic minimum bid increment
  const bidValidationSchema = z.object({
    bid: z.union([
      z.number().min(parsedMinimumBidIncrement, t("AUCTION.ERROR.MINIMUM_BID", { min: parsedMinimumBidIncrement })),
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
  } = useForm({
    resolver: zodResolver(bidValidationSchema),
    mode: "onChange",
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: {
      bid: undefined, // Keep bid as undefined initially for UX purposes
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
      //goToNextStep();
    }
  };

  // Function to handle click on the primary button.
  const handleButtonClick = () => {
    if (!isFormDisabled) {
      setBidFormData({ bid: bidValue });
      //goToNextStep();
    }
  };

  // Function to handle the "Cancel" action

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="form ">
        <div className="flex items-center gap-2">
          <input
            id="bid"
            {...register("bid", {
              setValueAs: (value) => parseFloat(value) || 0, // Ensure bid is always treated as a number
            })}
            className={`w-full input input-bordered bg-slate-50 ${errors.bid ? "input-error" : ""}`}
            placeholder={t("AUCTION.BID_PLACEHOLDER", {
              minimumBid: onDisplayAuction.startTime === 0 ? reservePrice : minimumBidIncrement,
            })}
          />

          <Button
            onClick={handleButtonClick}
            disabled={isFormDisabled}
            type="button"
            className={`${!isFormDisabled ? "btn-primary btn-outline" : ""}`}
          >
            {t("AUCTION.PLACE_BID_BUTTON")}
          </Button>
        </div>
        {errors.bid && (
          <div className="label">
            <span className="label-text error-message text-error">{errors.bid.message}</span>
          </div>
        )}
      </form>
    </>
  );
};

export { BidForm };
