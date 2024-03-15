import { useState, Fragment } from "react";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Layout from "@app/layouts/default";
import PageTitle from "@app/components/PageTitle";
import { Listbox, Transition } from "@headlessui/react";
import { createTags } from "@app/services/tokenService";
import { useRelayers } from "@app/hooks/useRelayers";

const Playground: NextPage = () => {
  const { t } = useTranslation("common");
  const [tagInput, setTagInput] = useState("");
  const [selectedRelayer, setSelectedRelayer] = useState<any | null>(null);
  console.log("selectedRelayer", selectedRelayer);

  const { relayers } = useRelayers({});

  const handleCreateTags = async () => {
    const tags = tagInput.split(",").map((tag) => tag.trim());
    if (tags.length > 0 && selectedRelayer) {
      await createTags(tags, selectedRelayer.id);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto mt-12">
        <div className="space-y-8">
          <PageTitle title={t("createTag")} />
          <input
            type="text"
            placeholder="Enter tag, e.g.: #tokenize"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="block w-full p-4 border rounded-lg"
          />
          <Listbox value={selectedRelayer} onChange={setSelectedRelayer}>
            {({ open }) => (
              <>
                <Listbox.Button className="relative w-full py-3 pl-4 pr-10 text-left bg-white border rounded-lg">
                  {selectedRelayer ? selectedRelayer.name : "Select a relayer"}
                </Listbox.Button>
                <Transition show={open} as={Fragment}>
                  <Listbox.Options className="p-1 mt-1 overflow-auto bg-white border rounded-md shadow-lg">
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

          <button
            onClick={handleCreateTags}
            className="px-8 py-3 text-base font-bold text-white bg-pink-500 border border-transparent rounded-lg"
            disabled={!tagInput || !selectedRelayer}
            style={{
              cursor: !tagInput || !selectedRelayer ? "not-allowed" : "pointer",
              backgroundColor: !tagInput || !selectedRelayer ? "#ccc" : "#f472b6",
            }}
          >
            Create
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Playground;
