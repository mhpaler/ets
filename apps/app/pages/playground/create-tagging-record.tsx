import { useState } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { computeTargetId, createTaggingRecord } from "@app/services/taggingService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount } from "wagmi";

const CreateTaggingRecord: NextPage = () => {
  const { t } = useTranslation("common");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [targetURI, setTargetURI] = useState("");
  const [recordType, setRecordType] = useState("");
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);
  const { address: tagger } = useAccount();
  const { relayers } = useRelayers({});
  const [toast, setToast] = useState<{
    show: boolean;
    message: string | JSX.Element;
    type: string;
  }>({ show: false, message: "", type: "" });

  const handleCreateTaggingRecord = async () => {
    try {
      const parsedTagIds = tagIds.map((tagId) => parseInt(tagId, 10));
      const targetId = await computeTargetId(targetURI);
      await createTaggingRecord(parsedTagIds, targetId, recordType, selectedRelayer.id, tagger);
      setToast({
        show: true,
        message: "Tagging record created successfully!",
        type: "alert-success",
      });
      // Clear input fields after successful creation
      setTagIds([]);
      setTargetURI("");
      setRecordType("");
    } catch (error) {
      console.error("Error creating tagging record:", error);
      setToast({
        show: true,
        message: "Failed to create tagging record.",
        type: "alert-error",
      });
    }
  };

  const handleSelectRelayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const relayerId = event.target.value;
    const selected = relayers.find((relayer: any) => relayer.id.toString() === relayerId);
    setSelectedRelayer(selected || null);
  };

  return (
    <Layout>
      <div className="space-y-4" style={{ width: "500px" }}>
        <PageTitle title={t("create-tagging-record")} />
        <input
          type="text"
          placeholder="Enter tag IDs separated by commas (e.g., 1,2,3)"
          value={tagIds.join(",")}
          onChange={(e) => setTagIds(e.target.value.split(",").map((id) => id.trim()))}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="Enter target URI (e.g., https://example.com)"
          value={targetURI}
          onChange={(e) => setTargetURI(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="Enter record type"
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="input input-bordered w-full"
        />
        <div className="relative">
          <select
            className="select select-bordered w-full max-w-xs"
            value={selectedRelayer ? selectedRelayer.id : ""}
            onChange={handleSelectRelayer}
          >
            <option disabled value="">
              Select a relayer
            </option>
            {relayers?.map((relayer: any, index: number) => (
              <option key={index} value={relayer.id}>
                {relayer.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateTaggingRecord}
          disabled={!tagIds.length || !targetURI || !recordType || !selectedRelayer}
          className={`btn ${
            !tagIds.length || !targetURI || !recordType || !selectedRelayer ? "btn-disabled" : "btn-primary"
          }`}
        >
          {t("Create")}
        </button>
      </div>
      {toast.show && (
        <div className="toast toast-center toast-middle">
          <div className={`alert ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CreateTaggingRecord;
