import { useState, useEffect } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { computeTargetId, createTaggingRecord } from "@app/services/taggingService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount } from "wagmi";
import Alert from "@app/components/Alert";

const CreateTaggingRecord: NextPage = () => {
  const { t } = useTranslation("common");
  const [tags, setTags] = useState("");
  const [recordType, setRecordType] = useState("");
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);
  const { address: tagger } = useAccount();
  const { relayers } = useRelayers({});
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState<string | JSX.Element>("");

  useEffect(() => {
    fetchRandomImage();
  }, []);

  const fetchRandomImage = async () => {
    try {
      const response = await fetch("https://source.unsplash.com/random?orientation=horizontal");
      setImageUrl(response.url);
    } catch (error) {
      console.error("Error fetching random image:", error);
    }
  };

  const handleCreateTaggingRecord = async () => {
    setIsLoading(true);
    try {
      const targetId = await computeTargetId(imageUrl);
      const tagIds = tags.split(",").map((tag) => BigInt(tag.trim()));

      await createTaggingRecord(tagIds, targetId, recordType, selectedRelayer.id, tagger);

      setAlertTitle("Success");
      setAlertDescription("Tagging record created successfully!");
      setShowAlert(true);
      setTags("");
      setRecordType("");
    } catch (error) {
      console.error("Error creating tagging record:", error);
      setAlertTitle("Error");
      setAlertDescription("Failed to create tagging record.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRelayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const relayerId = event.target.value;
    const selected = relayers.find((relayer: any) => relayer.id.toString() === relayerId);
    setSelectedRelayer(selected || null);
  };

  return (
    <Layout>
      <div className="col-span-7">
        <PageTitle title={t("create-tagging-record")} />
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold">Tag a random image</h2>
            <button onClick={fetchRandomImage} className="btn btn-primary btn-sm ml-auto">
              Refresh
            </button>
          </div>
          {imageUrl && <img src={imageUrl} alt="Random Image" className="mb-4" />}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter tags (e.g., #photo, #random)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter record type (e.g., discovery)"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="mb-4">
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
          <div className="flex justify-end">
            <button
              onClick={handleCreateTaggingRecord}
              disabled={isLoading || !imageUrl || !tags || !recordType || !selectedRelayer}
              className={`btn ${
                isLoading || !imageUrl || !tags || !recordType || !selectedRelayer ? "btn-disabled" : "btn-primary"
              }`}
            >
              {isLoading ? "Creating..." : t("Create")}
            </button>
          </div>
        </div>
      </div>
      <div className="col-span-5">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tagging Record Inputs</h2>
          <div className="mb-2">
            <span className="font-bold">Relayer:</span> {selectedRelayer ? selectedRelayer.name : "Select a relayer"}
          </div>
          <div className="mb-2 flex items-center">
            <span className="font-bold">Target:</span>
            <div className="truncate flex-1 mx-2">
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate"
                title="Click to view the full URL"
              >
                {imageUrl}
              </a>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(imageUrl)}
              className="btn btn-xs btn-outline"
              title="Copy URL"
            >
              Copy
            </button>
          </div>
          <div className="mb-2 flex items-center">
            <span className="font-bold">Tagger:</span>
            <div className="truncate flex-1 mx-2">{tagger}</div>
            <button
              onClick={() => tagger && navigator.clipboard.writeText(tagger)}
              className="btn btn-xs btn-outline"
              title="Copy URL"
            >
              Copy
            </button>
          </div>

          <div className="mb-2">
            <span className="font-bold">Record Type:</span> {recordType}
          </div>
        </div>
      </div>
      <Alert
        showAlert={showAlert}
        title={alertTitle}
        description={alertDescription}
        toggleAlert={() => setShowAlert(!showAlert)}
      />
    </Layout>
  );
};

export default CreateTaggingRecord;
