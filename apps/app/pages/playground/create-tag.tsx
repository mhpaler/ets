import { useState, Fragment, CSSProperties } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { Listbox, Transition } from "@headlessui/react";
import { createTags } from "@app/services/tokenService";
import { useRelayers } from "@app/hooks/useRelayers";
import { useAccount } from "wagmi";

const Playground: NextPage = () => {
  const { t } = useTranslation("common");
  const [tagInput, setTagInput] = useState("");
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);
  const { chain } = useAccount();
  const { relayers } = useRelayers({});
  const [showTooltip, setShowTooltip] = useState(false);
  console.log("showTooltip", showTooltip);

  const isCorrectNetwork = chain?.id === 80001; // Mumbai, should be adapted later
  const disabled = !tagInput || !selectedRelayer || !isCorrectNetwork;

  const getTooltipMessage = () => {
    if (!tagInput) return "Please enter a tag.";
    if (!selectedRelayer) return "Please select a relayer.";
    if (!isCorrectNetwork) return "Switch to the Mumbai network.";
    return "";
  };

  const handleCreateTags = async () => {
    if (!disabled) {
      const tags = tagInput.split(",").map((tag) => tag.trim());
      if (tags.length > 0 && selectedRelayer) {
        const tags = tagInput.split(",").map((tag) => tag.trim());
        if (tags.length > 0 && selectedRelayer) {
          await createTags(tags, selectedRelayer.id);
          setTagInput("");
        }
      }
    }
  };
  const tooltipStyle: CSSProperties = {
    visibility: showTooltip && disabled ? "visible" : "hidden",
    position: "absolute",
    width: "200px",
    backgroundColor: "black",
    color: "#fff",
    textAlign: "center",
    borderRadius: "6px",
    padding: "5px 0",
    zIndex: 1,
    bottom: "100%",
    left: 0,
    marginBottom: "5px",
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto mt-12">
        <div className="space-y-8">
          <PageTitle title={t("create-tag")} />
          <input
            type="text"
            placeholder="Enter tag, e.g.: #tokenize"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="block w-full p-4 border rounded-lg"
            style={{ minWidth: "300px" }}
          />
          <div className="relative">
            <Listbox value={selectedRelayer} onChange={setSelectedRelayer}>
              {({ open }) => (
                <>
                  <Listbox.Button className="relative w-full py-3 pl-4 pr-10 text-left bg-white border rounded-lg">
                    {selectedRelayer ? selectedRelayer.name : "Select a relayer"}
                  </Listbox.Button>
                  <Transition show={open} as={Fragment}>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 overflow-auto rounded-md border">
                      {relayers?.map((relayer: any, index: number) => (
                        <Listbox.Option
                          key={index}
                          value={relayer}
                          className="cursor-default select-none relative py-2 pl-10 pr-4 hover:bg-gray-100"
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                {relayer.name}
                              </span>
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </>
              )}
            </Listbox>
          </div>
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              onClick={handleCreateTags}
              disabled={disabled}
              className="px-8 py-3 text-base font-bold text-white bg-pink-500 border border-transparent rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {t("Create")}
            </button>
            <div style={tooltipStyle}>{getTooltipMessage()}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Playground;
