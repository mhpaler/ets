import TagInput from "@app/components/TagInput";
import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { useRelayers } from "@app/hooks/useRelayers";
import useToast from "@app/hooks/useToast";
import Layout from "@app/layouts/default";
import type { TagInput as TagInputType } from "@app/types/tag";
import { isValidTag } from "@app/utils/tagUtils";
import { useRelayerClient, useTokenClient } from "@ethereum-tag-service/sdk-react-hooks";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";
import { useAccount } from "wagmi";

const CreateTag: NextPage = () => {
  const { t } = useTranslation("common");
  const { showToast, ToastComponent } = useToast();
  const { chain, isConnected, address } = useAccount();
  const { serverEnvironment } = useEnvironmentContext();
  const [tags, setTags] = useState<TagInputType[]>([]);
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);

  const { tagExists } = useTokenClient({
    chainId: chain?.id,
    account: address,
    environment: serverEnvironment,
  });

  const { createTags } = useRelayerClient({
    relayerAddress: selectedRelayer?.id,
    account: address,
    chainId: chain?.id,
    environment: serverEnvironment,
  });
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const { relayers } = useRelayers({});
  const disabled = !tags.length || !selectedRelayer || isCreatingTag;

  const getTooltipMessage = () => {
    if (!isConnected) return t("connect-wallet");
    if (!tags.length) return t("please-enter-a-tag");
    if (!selectedRelayer) return t("please-select-a-relayer");
    if (isCreatingTag) return t("creating-tags");
    return "";
  };

  const handleSelectRelayer = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const relayerId = event.target.value;
    const selected = relayers?.find((relayer: any) => relayer.id.toString() === relayerId);
    setSelectedRelayer(selected || null);
  };

  const handleCreateTags = async () => {
    if (!disabled) {
      setIsCreatingTag(true);
      try {
        if (tags.length > 0) {
          const tagValues = tags.map((tag) => tag.text);
          await createTags?.(tagValues);
        }

        setTags([]);

        const successMessage = (
          <>
            {t("tag-created-successfully")}{" "}
            {tags.map((tag, index) => (
              <span key={index}>
                <a
                  href={`/explore/ctags/${tag.text.startsWith("#") ? tag.text.slice(1) : tag.text}`}
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
      } catch (_error) {
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
    setTags(tags.filter((_tag, index) => index !== i));
  };

  const handleAddTag = async (tag: TagInputType) => {
    if (isValidTag(tag.text)) {
      const exists = await tagExists?.(tag.text);
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
      <div className="col-span-12 md:col-span-6">
        <div className="space-y-4">
          <TagInput tags={tags} handleDeleteTag={handleDeleteTag} handleAddTag={handleAddTag} />
          <div className="relative">
            <select
              className="select select-bordered w-full"
              value={selectedRelayer ? selectedRelayer?.id : ""}
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
              className={`btn w-full ${disabled ? "btn-disabled" : "btn-primary"}`}
            >
              {isCreatingTag ? "Creating..." : t("create")}
            </button>
          </div>
        </div>
      </div>
      {ToastComponent}
    </Layout>
  );
};

export default CreateTag;
