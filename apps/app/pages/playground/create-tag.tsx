import { useState } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { createTags, tagExists } from "@app/services/tokenService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount, useChainId } from "wagmi";
import { availableChainIds } from "@app/config/wagmiConfig";
import { isValidTag } from "@app/utils/tagUtils";
import useToast from "@app/hooks/useToast";
import TagInput from "@app/components/TagInput";
import { TagInput as TagInputType } from "@app/types/tag";

const Playground: NextPage = () => {
  const { t } = useTranslation("common");
  const { showToast, ToastComponent } = useToast();
  const { chain } = useAccount();
  const chainId = useChainId();
  const [tags, setTags] = useState<TagInputType[]>([]);
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const { relayers } = useRelayers({});
  const isCorrectNetwork = chain?.id && availableChainIds.includes(chain?.id as any);
  const disabled = !tags.length || !selectedRelayer || !isCorrectNetwork || isCreatingTag;

  const getTooltipMessage = () => {
    if (!tags.length) return t("please-enter-a-tag");
    if (!selectedRelayer) return t("please-select-a-relayer");
    if (!isCorrectNetwork) return t("switch-to-mumbai-network");
    if (isCreatingTag) return t("creating-tags");
    return "";
  };

  const handleSelectRelayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const relayerId = event.target.value;
    const selected = relayers.find((relayer: any) => relayer.id.toString() === relayerId);
    setSelectedRelayer(selected || null);
  };

  const handleCreateTags = async () => {
    if (!disabled) {
      setIsCreatingTag(true);
      try {
        if (tags.length > 0) {
          const tagValues = tags.map((tag) => tag.text);
          await createTags(tagValues, selectedRelayer.id, chainId);
        }

        setTags([]);

        const successMessage = (
          <>
            {t("tag-created-successfully")}{" "}
            {tags.map((tag, index) => (
              <span key={index}>
                <a
                  href={`/tags/${tag.text.startsWith("#") ? tag.text.slice(1) : tag.text}`}
                  className="link link-primary"
                  style={{ textDecoration: "underline" }}
                >
                  {tag.text}
                </a>
                {index !== tags.length - 1 && ", "}
              </span>
            ))}
            .
          </>
        );
        showToast({
          title: "Success",
          description: successMessage,
        });
      } catch (error) {
        showToast({
          title: "Error",
          description: t("failed-to-create-tags"),
        });
      } finally {
        setIsCreatingTag(false);
      }
    }
  };

  const handleDeleteTag = (i: number) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddTag = async (tag: TagInputType) => {
    if (isValidTag(tag.text)) {
      const exists = await tagExists(tag.text, chainId);
      if (exists) {
        showToast({
          description: t("tag-already-exists"),
        });
      } else {
        setTags((prevTags) => [...prevTags, tag]);
      }
    } else {
      showToast({
        description: t("invalid-tag-message"),
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-4" style={{ width: "300px" }}>
        <PageTitle title={t("create-tag")} />
        <TagInput tags={tags} handleDeleteTag={handleDeleteTag} handleAddTag={handleAddTag} />
        <div className="relative">
          <select
            className="select select-bordered w-full max-w-xs"
            value={selectedRelayer ? selectedRelayer.id : ""}
            onChange={handleSelectRelayer}
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
      {ToastComponent}
    </Layout>
  );
};

export default Playground;
