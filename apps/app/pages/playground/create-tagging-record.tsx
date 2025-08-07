import TaggingForm from "@app/components/TaggingForm";
import useToast from "@app/hooks/useToast";
import Layout from "@app/layouts/default";
import { useRelayerClient } from "@ethereum-tag-service/sdk-react-hooks";
import debounce from "lodash.debounce";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Hex } from "viem";
import { useAccount } from "wagmi";

const fetchRandomImage = async (accessKey: string): Promise<string | null> => {
  if (!accessKey) {
    console.error("Unsplash Access Key is not defined");
    return null;
  }
  const url = `https://api.unsplash.com/photos/random?orientation=landscape&client_id=${accessKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.urls.regular;
  } catch (error) {
    console.error("Error fetching random image:", error);
    return null;
  }
};

const CreateTaggingRecord: NextPage = () => {
  const { t } = useTranslation("common");
  const { showToast, ToastComponent } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [selectedRelayer, setSelectedRelayer] = useState<{ id: Hex; name: string } | null>(null);
  const [taggingRecordId, setTaggingRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { address: tagger, chain } = useAccount();
  const { createTaggingRecord } = useRelayerClient({
    relayerAddress: selectedRelayer?.id,
    account: tagger,
    chainId: chain?.id,
  });
  const [activeTab, setActiveTab] = useState<"random" | "url">("random");

  const fetchRandomImageDebounced = useCallback(
    debounce(async () => {
      const newImageUrl = await fetchRandomImage(process.env.NEXT_PUBLIC_UNSPLASH_KEY as string);
      if (newImageUrl) {
        setImageUrl(newImageUrl);
      }
    }, 300),
    [],
  );

  useEffect(() => {
    fetchRandomImageDebounced();
    return () => {
      fetchRandomImageDebounced.cancel();
    };
  }, [fetchRandomImageDebounced]);

  const handleCreateTaggingRecord = async (tagValues: string[], target: string, recordType: string) => {
    setIsLoading(true);
    try {
      const recordId = await createTaggingRecord?.(tagValues, target, recordType);

      if (recordId) {
        setTaggingRecordId(recordId);
      }

      showToast({
        title: "Success",
        description: (
          <>
            {t("tagging-record-created-successfully")}
            <Link
              href={`/explore/tagging-records/${recordId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline"
            >
              View tagging record
            </Link>
          </>
        ),
      });
    } catch (error) {
      console.error("Error creating tagging record:", error);
      showToast({
        title: "Error",
        description: t("error-creating-tagging-record"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="col-span-12 sm:col-span-7">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4 min-w-[300px]">
            <div role="tablist" className="tabs tabs-bordered w-full">
              <input
                type="radio"
                name="create_record_tabs"
                role="tab"
                className="tab flex-1 text-lg font-semibold"
                aria-label="Tag a random image"
                checked={activeTab === "random"}
                onChange={() => setActiveTab("random")}
              />
              <input
                type="radio"
                name="create_record_tabs"
                role="tab"
                className="tab flex-1 text-lg font-semibold"
                aria-label="Tag a URL"
                checked={activeTab === "url"}
                onChange={() => setActiveTab("url")}
              />
            </div>
          </div>

          <div>
            {activeTab === "random" && (
              <div role="tabpanel">
                <div className="flex items-center">
                  <button onClick={fetchRandomImageDebounced} className="btn btn-primary btn-sm ml-auto">
                    {t("refresh")}
                  </button>
                </div>
                {imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={imageUrl}
                      // biome-ignore lint/a11y/noRedundantAlt: <explanation>
                      alt="Random Image"
                      className="object-cover w-full my-4"
                      style={{ maxHeight: "300px" }}
                    />
                  </div>
                )}
                <TaggingForm
                  target={imageUrl}
                  onCreateRecord={handleCreateTaggingRecord}
                  isLoading={isLoading}
                  selectedRelayer={selectedRelayer}
                  setSelectedRelayer={setSelectedRelayer}
                />
              </div>
            )}

            {activeTab === "url" && (
              <div className="pt-8">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter URL (e.g., https://example.com/image.jpg)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="input input-bordered w-full"
                    aria-label="URL Input"
                  />
                </div>
                <TaggingForm
                  target={urlInput}
                  onCreateRecord={handleCreateTaggingRecord}
                  isLoading={isLoading}
                  selectedRelayer={selectedRelayer}
                  setSelectedRelayer={setSelectedRelayer}
                />
              </div>
            )}
          </div>

          {taggingRecordId && (
            <div className="mt-4">
              <Link
                href={`/explore/tagging-records/${taggingRecordId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View tagging record
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 sm:col-span-5">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{t("tagging-record-inputs")}</h2>
          <div className="mb-2 flex items-center">
            <span className="font-bold">{t("target")}:</span>
            <div className="truncate flex-1 mx-2">
              <a
                href={imageUrl || urlInput}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate"
                title="Click to view the full URL"
              >
                {imageUrl || urlInput || "/"}
              </a>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(imageUrl || urlInput)}
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
        </div>
      </div>
      {ToastComponent}
    </Layout>
  );
};

export default CreateTaggingRecord;
