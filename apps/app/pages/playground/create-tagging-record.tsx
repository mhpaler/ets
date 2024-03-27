import { useState, useEffect } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { computeTargetId, createTaggingRecord } from "@app/services/taggingService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount } from "wagmi";
// import { Web3Storage } from "web3.storage";
import { computeTagId, createTags, tagExists } from "@app/services/tokenService";

const CreateTaggingRecord: NextPage = () => {
  const { t } = useTranslation("common");
  const [tagsInput, setTagsInput] = useState("");
  const [targetURI, setTargetURI] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState("");
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);
  const { address: tagger } = useAccount();
  const { relayers } = useRelayers({});
  const [toast, setToast] = useState<{ show: boolean; message: string | JSX.Element; type: string }>({
    show: false,
    message: "",
    type: "",
  });
  const [isTagsValid, setIsTagsValid] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkTagsValidity = async () => {
      const tags = tagsInput.split(",").map((tag) => tag.trim());
      const validity = await Promise.all(tags.map(async (tag) => await tagExists(tag)));
      setIsTagsValid(validity);
    };

    if (tagsInput) {
      checkTagsValidity();
    } else {
      setIsTagsValid([]);
    }
  }, [tagsInput]);

  const handleCreateTaggingRecord = async () => {
    setIsLoading(true);
    try {
      let targetId;
      if (targetURI) {
        targetId = await computeTargetId(targetURI);
      } else if (imageFile) {
        const imageLink = await uploadImageToIPFS(imageFile);
        targetId = await computeTargetId(imageLink);
      } else {
        setToast({
          show: true,
          message: "Please enter either a target URI or upload an image.",
          type: "alert-error",
        });
        setIsLoading(false);
        return;
      }

      const tags = tagsInput.split(",").map((tag) => tag.trim());
      let tagsToCreate = [];
      let tagIds = [];

      for (let i = 0; i < tags.length; i++) {
        if (!isTagsValid[i]) {
          tagsToCreate.push(tags[i]);
        } else {
          tagIds.push(await computeTagId(tags[i]));
        }
      }

      if (tagsToCreate.length > 0) {
        await createTags(tagsToCreate, selectedRelayer.address);
        const newTagIds = await Promise.all(tagsToCreate.map((tag) => computeTagId(tag)));
        tagIds = tagIds.concat(newTagIds);
      }

      await createTaggingRecord(tagIds, targetId, recordType, selectedRelayer.id, tagger);

      setToast({
        show: true,
        message: "Tagging record created successfully!",
        type: "alert-success",
      });
      setTagsInput("");
      setTargetURI("");
      setImageFile(null);
      setRecordType("");
    } catch (error) {
      console.error("Error creating tagging record:", error);
      setToast({
        show: true,
        message: "Failed to create tagging record.",
        type: "alert-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRelayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const relayerId = event.target.value;
    const selected = relayers.find((relayer: any) => relayer.id.toString() === relayerId);
    setSelectedRelayer(selected || null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageFile(file || null);
  };

  const uploadImageToIPFS = async (file: File): Promise<string> => {
    // const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN! });
    // const cid = await client.put([file], { wrapWithDirectory: false });
    // const imageLink = `https://${cid}.ipfs.w3s.link/${file.name}`;
    // return imageLink;

    return "";
  };

  return (
    <Layout>
      <div
        className="max-w-2xl mx-auto"
        style={{
          width: "500px",
        }}
      >
        <PageTitle title={t("create-tagging-record")} />
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold">Create a Tagging Record</h2>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter target URI (e.g., https://example.com)"
              value={targetURI}
              onChange={(e) => setTargetURI(e.target.value)}
              className="input input-bordered w-full"
            />
            <span className="text-sm text-gray-500">or</span>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input file-input-bordered w-full"
              />
            </div>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter tag (e.g., #mytag)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="input input-bordered w-full"
            />
            {!isTagsValid && tagsInput && (
              <div className="text-error text-sm mt-1">Tag does not exist. Creating a new tag...</div>
            )}
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Enter record type (e.g., blog post, tweet, etc.)"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="textarea textarea-bordered w-full"
            ></textarea>
          </div>
          <div className="mb-4">
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
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateTaggingRecord}
              disabled={isLoading || (!targetURI && !imageFile) || !tagsInput || !recordType || !selectedRelayer}
              className={`btn ${
                isLoading || (!targetURI && !imageFile) || !tagsInput || !recordType || !selectedRelayer
                  ? "btn-disabled"
                  : "btn-primary"
              }`}
            >
              {isLoading ? "Creating..." : t("Create")}
            </button>
          </div>
        </div>
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
