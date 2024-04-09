import { useState, useEffect, useCallback } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { createTaggingRecord } from "@app/services/taggingService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount } from "wagmi";
import { WithContext as ReactTags } from "react-tag-input";
import { isValidTag } from "@app/utils/tagUtils";
import { Hex } from "viem";
import debounce from "lodash.debounce";
import useToast from "@app/hooks/useToast";
import { QuestionMark } from "@app/components/icons";

interface Tag {
  id: string;
  text: string;
}

const KeyCodes = {
  comma: 188,
  enter: 13,
  tab: 9,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter, KeyCodes.tab];

const CreateTaggingRecord: NextPage = () => {
  const { t } = useTranslation("common");
  const { showToast, ToastComponent } = useToast();
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [recordType, setRecordType] = useState<string>("");
  const [selectedRelayer, setSelectedRelayer] = useState<{ id: Hex; name: string } | null>(null);
  const { address: tagger } = useAccount();
  const { relayers } = useRelayers({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleDeleteTag = useCallback(
    (i: number) => {
      setTags(tags.filter((tag, index) => index !== i));
    },
    [tags],
  );

  const handleAddTag = useCallback(
    (tag: Tag) => {
      setTagInput("");
      if (isValidTag(tag.text)) {
        setTags((prevTags) => [...prevTags, tag]);
      } else {
        showToast({
          title: "Error",
          description: t("invalid-tag-message"),
        });
      }
    },
    [showToast, t],
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

        showToast({
          title: "Success",
          description: t("tagging-record-created-successfully"),
        });

        setTags([]);
        setRecordType("");
      } catch (error) {
        console.error("Error creating tagging record:", error);

        showToast({
          title: "Error",
          description: t("error-creating-tagging-record"),
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      showToast({
        title: "Error",
        description: t("please-select-a-relayer"),
      });
    }
  };

  return (
    <Layout>
      <div className="col-span-7">
        <PageTitle title={t("create-tagging-record")} />
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold">{t("tag-random-image")}</h2>
            <button onClick={fetchRandomImage} className="btn btn-primary btn-sm ml-auto">
              {t("refresh")}
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
          <div className="mb-4 w-full flex flex-col relative">
            <ReactTags
              tags={tags}
              handleDelete={handleDeleteTag}
              handleAddition={handleAddTag}
              inputValue={tagInput}
              handleInputChange={setTagInput}
              delimiters={delimiters}
              placeholder="Enter tags (e.g. #Tokenize, #love)"
              inputFieldPosition="bottom"
              autocomplete
            />
            <div
              className="tooltip absolute flex justify-center items-center right-1 top-6"
              data-tip="Press enter, comma or tab to add tags"
              style={{ transform: "translateY(-50%)" }}
            >
              <QuestionMark color="blue" size={26} />
            </div>
            {tagInput && !isValidTag(tagInput) && tagInput !== "#" && (
              <div className="text-error mt-1 text-xs">{t("invalid-tag-message")}</div>
            )}
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
                  <span className="animate-spin">&#9696;</span> {t("creating")}...
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
          <h2 className="text-lg font-semibold mb-4">{t("tagging-record-inputs")}</h2>
          <div className="mb-2">
            <span className="font-bold">{t("relayer")}:</span> {selectedRelayer ? selectedRelayer.name : "/"}
          </div>
          <div className="mb-2 flex items-center">
            <span className="font-bold">{t("target")}:</span>
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
              {t("copy")}
            </button>
          </div>
          <div className="mb-2 flex items-center">
            <span className="font-bold">{t("tagger")}:</span>
            <div className="truncate flex-1 mx-2">{tagger || "/"}</div>
            <button
              onClick={() => tagger && navigator.clipboard.writeText(tagger)}
              className="btn btn-xs btn-outline"
              title="Copy URL"
            >
              {t("copy")}
            </button>
          </div>

          <div className="mb-2">
            <span className="font-bold">{t("record-type")}:</span> {recordType || "/"}
          </div>
        </div>
      </div>
      {ToastComponent}
    </Layout>
  );
};

export default CreateTaggingRecord;
