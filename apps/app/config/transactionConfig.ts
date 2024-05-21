import { TransactionType } from "@app/types/transaction"; // Adjust import paths as necessary
import { BidConfirm, BidInput, SettleConfirm, AddRelayerConfirm, AddRelayerInput } from "@app/components/transaction";

export interface StepConfig {
  component: React.ComponentType<any>;
  props?: { [key: string]: any };
}
// Define the transaction configuration
// prettier-ignore
export const transactionConfig: { [key in TransactionType]: StepConfig[] } = {
  [TransactionType.AddRelayer]: [
    { component: AddRelayerInput },
    { component: AddRelayerConfirm }
  ],
  [TransactionType.Bid]: [
    { component: BidInput },
    { component: BidConfirm }
  ],
  [TransactionType.SettleAuction]: [
    { component: SettleConfirm }
  ],
};
