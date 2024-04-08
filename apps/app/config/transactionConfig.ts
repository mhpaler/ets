import { TransactionType } from "@app/types/transaction"; // Adjust import paths as necessary
import { BidConfirm, BidInput, SettleConfirm, AddRelayerConfirm, AddRelayerInput } from "@app/components/transaction";

export interface StepConfig {
  component: React.ComponentType<any>;
  props?: { [key: string]: any };
}
// Define the transaction configurations
export const transactionConfig: { [key in TransactionType]: StepConfig[] } = {
  [TransactionType.AddRelayer]: [
    {
      component: AddRelayerInput,
      props: {
        /* props needed for AddRelayerForm */
      },
    },
    {
      component: AddRelayerConfirm,
      props: {
        /* props for confirmation */
      },
    },
  ],
  [TransactionType.Bid]: [
    {
      component: BidInput,
      props: {
        /* props for BidForm */
      },
    },
    {
      component: BidConfirm,
      props: {
        /* props for ConfirmBid */
      },
    },
  ],
  [TransactionType.SettleAuction]: [
    {
      component: SettleConfirm,
      props: {
        /* props for ConfirmSettleAuction */
      },
    },
  ],
};
