import React, { useState } from "react";
import { WithContext as ReactTags } from "react-tag-input";
import { QuestionMark } from "@app/components/icons";
import useTranslation from "next-translate/useTranslation";
import { isValidTag } from "@app/utils/tagUtils";
import { TagInput } from "@app/types/tag";

const KeyCodes = {
  comma: 188,
  enter: 13,
  tab: 9,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter, KeyCodes.tab];

interface TagComponentProps {
  tags: TagInput[];
  handleDeleteTag: (i: number) => void;
  handleAddTag: (tag: TagInput) => void;
  infoInside?: boolean;
}

const TagComponent: React.FC<TagComponentProps> = ({ tags, handleDeleteTag, handleAddTag, infoInside }) => {
  const [tagInput, setTagInput] = useState<string>("");

  const { t } = useTranslation("common");

  return (
    <div className="mb-4 w-full flex flex-col relative">
      <ReactTags
        tags={tags}
        handleDelete={handleDeleteTag}
        handleAddition={(tag) => {
          setTagInput("");
          handleAddTag(tag);
        }}
        inputValue={tagInput}
        classNames={{
          tag: "text-sm font-medium inline-block py-1 px-2 rounded link-primary bg-primary-content mt-2 last:mr-0 mr-1",
          tagInputField: "input input-bordered w-full",
          selected: "flex flex-wrap gap-1",
          remove: "btn btn-ghost btn-xs",
          suggestions: "dropdown dropdown-bottom",
          activeSuggestion: "bg-primary text-primary-content cursor-pointer",
        }}
        handleInputChange={setTagInput}
        delimiters={delimiters}
        placeholder="Enter tags (e.g. #Tokenize, #love)"
        inputFieldPosition="bottom"
        autocomplete
      />
      <div
        className="tooltip absolute flex justify-center items-center top-6"
        data-tip="Press enter, comma or tab to add tags"
        style={{ transform: "translateY(-50%)", right: infoInside ? 6 : -30 }}
      >
        <QuestionMark color="blue" size={26} />
      </div>
      {tagInput && !isValidTag(tagInput) && tagInput !== "#" && (
        <div className="text-error mt-1 text-xs">{t("invalid-tag-message")}</div>
      )}
    </div>
  );
};

export default TagComponent;
