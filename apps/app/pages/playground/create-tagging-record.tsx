import { useState, useEffect, useCallback, SetStateAction } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { createTaggingRecord } from "@app/services/taggingService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount } from "wagmi";
import Alert from "@app/components/Alert";
import { WithContext as ReactTags } from "react-tag-input";
import { isValidTag } from "@app/utils/tagUtils";
import { Hex } from "viem";
import debounce from "lodash.debounce";

interface Tag {
  id: string;
  text: string;
}

const KeyCodes = {
  comma: 188,
  enter: 13,
};

// Add tags with comma or enter
const delimiters = [KeyCodes.comma, KeyCodes.enter];

const CreateTaggingRecord: NextPage = () => {
  const { t } = useTranslation("common");
  const [tags, setTags] = useState<Tag[]>([]);
  const [recordType, setRecordType] = useState<string>("");
  const [selectedRelayer, setSelectedRelayer] = useState<{ id: Hex; name: string } | null>(null);
  const { address: tagger } = useAccount();
  const { relayers } = useRelayers({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertDescription, setAlertDescription] = useState<string | JSX.Element>("");
  const [tagInput, setTagInput] = useState<string>("");

  const handleDeleteTag = useCallback(
    (i: number) => {
      setTags(tags.filter((tag, index) => index !== i));
    },
    [tags],
  );

  const handleAddTag = useCallback(
    (tag: Tag) => {
      if (isValidTag(tag.text)) {
        setTags((prevTags) => [...prevTags, tag]);
        setTagInput("");
      } else {
        setAlertDescription(t("invalid-tag-message"));
        setShowAlert(true);
        setTagInput(tag.text);
      }
    },
    [t],
  );

  const handleSelectRelayer = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const relayerId = event.target.value;
      const selected = relayers.find((relayer: any) => relayer.id.toString() === relayerId);
      setSelectedRelayer(selected || null);
    },
    [relayers],
  );

  const fetchRandomImage = useCallback(
    debounce(async () => {
      try {
        const response = await fetch("https://source.unsplash.com/random?orientation=horizontal");
        setImageUrl(response.url);
      } catch (error) {
        console.error("Error fetching random image:", error);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    fetchRandomImage();
    return () => {
      fetchRandomImage.cancel();
    };
  }, [fetchRandomImage]);

  const handleCreateTaggingRecord = async () => {
    if (selectedRelayer) {
      setIsLoading(true);
      try {
        const tagValues = tags.map((tag) => tag.text);
        await createTaggingRecord(tagValues, imageUrl, recordType, selectedRelayer.id);

        setAlertTitle("Success");
        setAlertDescription(t("tagging-record-created-successfully"));
        setShowAlert(true);
        setTags([]);
        setRecordType("");
      } catch (error) {
        console.error("Error creating tagging record:", error);
        setAlertTitle("Error");
        setAlertDescription(t("error-creating-tagging-record"));
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      setAlertTitle("Error");
      setAlertDescription(t("please-select-a-relayer"));
      setShowAlert(true);
    }
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
          {imageUrl && (
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Random Image"
                className="object-cover w-full my-4"
                style={{ maxHeight: "300px" }}
              />
            </div>
          )}
          <div className="mb-4 w-full">
            <ReactTags
              tags={tags}
              handleDelete={handleDeleteTag}
              handleAddition={handleAddTag}
              delimiters={delimiters}
              placeholder="Enter tags (e.g., #photo, #random)"
              inputFieldPosition="bottom"
              autocomplete
              handleInputChange={(value: SetStateAction<string>) => setTagInput(value)}
              inputValue={tagInput}
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter record type (e.g., discovery)"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="input input-bordered w-full"
              aria-label="Record Type"
            />
          </div>
          <div className="mb-4">
            <select
              className="select select-bordered w-full max-w-xs"
              value={selectedRelayer ? selectedRelayer.id : ""}
              onChange={handleSelectRelayer}
              aria-label="Select Relayer"
            >
              <option disabled value="">
                {t("select-a-relayer")}
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
              disabled={isLoading || !imageUrl || tags.length === 0 || !recordType || !selectedRelayer}
              className={`btn ${
                isLoading || !imageUrl || tags.length === 0 || !recordType || !selectedRelayer
                  ? "btn-disabled"
                  : "btn-primary"
              }`}
              aria-label="Create Tagging Record"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">&#9696;</span> Creating...
                </>
              ) : (
                t("Create")
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="col-span-5">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tagging Record Inputs</h2>
          <div className="mb-2">
            <span className="font-bold">Relayer:</span> {selectedRelayer ? selectedRelayer.name : "/"}
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
            <span className="font-bold">Record Type:</span> {recordType || "/"}
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
