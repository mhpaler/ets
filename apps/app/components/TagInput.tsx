import { QuestionMark } from "@app/components/icons";
import type { TagInput as TagInputType } from "@app/types/tag";
import { isValidTag } from "@app/utils/tagUtils";
import useTranslation from "next-translate/useTranslation";
import type React from "react";
import { useState } from "react";
import { WithContext as ReactTags } from "react-tag-input";

const KeyCodes = {
  comma: 188,
  enter: 13,
  tab: 9,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter, KeyCodes.tab];

interface TagInputProps {
  tags: TagInputType[];
  handleDeleteTag: (i: number) => void;
  handleAddTag: (tag: TagInputType) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, handleDeleteTag, handleAddTag }) => {
  const { t } = useTranslation("common");
  const [tagInput, setTagInput] = useState<string>("");
  const tagClassNames = {
    tags: "flex flex-wrap gap-1",
    tag: "text-sm font-medium inline-flex items-center py-1 pl-2 pr-0 rounded link-primary hover:scale-105 transition-all duration-300 bg-primary-content last:mr-0 mr-1 mb-2 flex items-center", // added flex and items-center to handle the button alignment
    remove:
      "ReactTags__remove leading-none min-h-0 h-4 w-4 btn btn-circle btn-xs hover:btn-primary border-transparent bg-transparent mx-1.5 [&>svg]:stroke-[3] [&>svg]:-mr-0.5 [&>svg]:fill-slate-900 [&:hover>svg]:fill-white [&>svg]:h-2 [&>svg]:w-2",
    tagInput: "input input-bordered w-full pr-10 pl-0",
    tagInputField: "input border-none w-full pr-10",
    selected: "flex flex-wrap gap-1",
    suggestions: "dropdown dropdown-bottom",
    activeSuggestion: "bg-primary text-primary-content cursor-pointer",
    editTagInput: "input input-bordered w-full pr-10",
    editTagInputField: "input input-bordered w-full pr-10",
    clearAll: "btn btn-ghost btn-xs",
  };

  return (
    <div className="mb-4 w-full">
      <div className="relative">
        <ReactTags
          tags={tags}
          handleDelete={handleDeleteTag}
          handleAddition={(tag) => {
            setTagInput("");
            handleAddTag(tag);
          }}
          inputValue={tagInput}
          classNames={tagClassNames}
          handleInputChange={setTagInput}
          delimiters={delimiters}
          placeholder="Enter tags (e.g. #Tokenize, #love)"
          inputFieldPosition="bottom"
          autocomplete
        />
        <div
          className="tooltip tooltip-left md:tooltip-top absolute flex justify-center items-center"
          data-tip="Press enter, comma or tab to add tags"
          style={{
            top: "calc(100% - 1.5rem)", // Adjusted to move it down a bit
            right: "0.5rem",
            transform: "translateY(-50%)",
            zIndex: 100,
          }}
        >
          <QuestionMark color="#db2777" size={26} />
        </div>
      </div>
      {tagInput && !isValidTag(tagInput) && tagInput !== "#" && (
        <div className="text-error mt-1 text-xs">{t("invalid-tag-message")}</div>
      )}
    </div>
  );
};
export default TagInput;
