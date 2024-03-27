import { useState, useEffect } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { createTags, tagExists } from "@app/services/tokenService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount } from "wagmi";
import { availableChainIds } from "@app/constants/config";
import { isValidTag } from "@app/utils/tagUtils";

const Playground: NextPage = () => {
  const { t } = useTranslation("common");
  const invalidTagMsg = t("invalid-tag-msg");
  const { chain } = useAccount();
  const [tagInput, setTagInput] = useState("");
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);
  const [exists, setExists] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    description: string | JSX.Element;
  }>({ show: false, title: "", description: "" });
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const { relayers } = useRelayers({});
  const isCorrectNetwork = chain?.id && availableChainIds.includes(chain?.id);

  const disabled = !isValidTag(tagInput) || !selectedRelayer || !isCorrectNetwork || exists || isCreatingTag; // Added isCreatingTag to the disabled condition

  const getTooltipMessage = () => {
    if (!tagInput) return t("please-enter-a-tag");
    if (!isValidTag(tagInput)) return invalidTagMsg;
    if (exists) return t("this-tag-already-exists-please-enter-a-different-tag");
    if (!selectedRelayer) return t("please-select-a-relayer");
    if (!isCorrectNetwork) return t("switch-to-mumbai-network");
    if (isCreatingTag) return t("creating-tag");
    return "";
  };

  useEffect(() => {
    let debounceTimer: any;
    const checkTagExists = async () => {
      if (tagInput) {
        const exists = await tagExists(tagInput);
        setExists(exists);
      }
    };

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      checkTagExists();
    }, 300);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [tagInput]);

  const handleSelectRelayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const relayerId = event.target.value;
    const selected = relayers.find((relayer: any) => relayer.id.toString() === relayerId);
    setSelectedRelayer(selected || null);
  };

  const handleCreateTags = async () => {
    if (!disabled) {
      setIsCreatingTag(true);
      try {
        const firstTag = tagInput.trim();
        await createTags([firstTag], selectedRelayer.id);
        setTagInput("");

        const tagWithoutHashtag = firstTag.startsWith("#") ? firstTag.slice(1) : firstTag;
        const viewTagUrl = `/tags/${tagWithoutHashtag}`;
        const successMessage = (
          <>
            {t("tag-created-successfully")}{" "}
            <a href={viewTagUrl} className="link link-primary" style={{ textDecoration: "underline" }}>
              View tag here
            </a>
            .
          </>
        );

        setAlert({ show: true, title: "Success", description: successMessage });
      } catch (error) {
        console.error("Error creating tags:", error);
        setAlert({ show: true, title: "Error", description: "Failed to create tags." });
      } finally {
        setIsCreatingTag(false);
      }
    }
  };

  return (
    <Layout>
      <div
        className="space-y-4"
        style={{
          width: "300px",
        }}
      >
        <PageTitle title={t("create-tag")} />
        <input
          type="text"
          placeholder="Enter tag, e.g.: #tokenize"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="input input-bordered w-full"
        />

        {tagInput && !isValidTag(tagInput) && tagInput !== "#" && (
          <div className="text-error mt-2 text-xs">{invalidTagMsg}</div>
        )}
        {exists && (
          <div className="text-error mt-2 text-xs">This tag already exists. Please enter a different tag.</div>
        )}
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
        <div className={`${disabled ? "tooltip" : ""}`} data-tip={getTooltipMessage()}>
          <button
            onClick={handleCreateTags}
            disabled={disabled}
            className={`btn ${disabled ? "btn-disabled" : "btn-primary"}`}
          >
            {isCreatingTag ? "Creating..." : t("create")}
          </button>
        </div>
      </div>
      {alert.show && (
        <div className="alert alert-info">
          <div>
            <h3 className="font-bold">{alert.title}</h3>
            <div className="text-sm">{alert.description}</div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Playground;
