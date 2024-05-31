import { TransactionType } from "@app/types/transaction"; // Adjust import paths as necessary
import { BidConfirm, BidInput, SettleConfirm } from "@app/components/transaction";
import dynamic from "next/dynamic";

const AddRelayerConfirm = dynamic(
  () => import("@app/components/transaction/relayer/add/AddRelayerConfirm").then((mod) => mod.AddRelayerConfirm),
  {
    ssr: false,
  },
);

const AddRelayerInput = dynamic(
  () => import("@app/components/transaction/relayer/add/AddRelayerInput").then((mod) => mod.AddRelayerInput),
  {
    ssr: false,
  },
);

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
