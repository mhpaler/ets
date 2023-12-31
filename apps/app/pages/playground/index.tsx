import { useState, Fragment } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { Button } from "../../components/Button";
import PageTitle from "../../components/PageTitle";
import { Listbox, Transition } from "@headlessui/react";
import { useContractWrite } from "wagmi";
import ETSTokenABI from "../../abi/ETSToken.json";

const people = [
  { name: "zachwilliams.eth" },
  { name: "swaylocks.eth" },
  { name: "nadim.eth" },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Playground: NextPage = () => {
  // const { query } = useRouter();
  // const { tag } = query;
  const { t } = useTranslation("common");

  const [selected, setSelected] = useState(people[0]);

  const { data, error, isSuccess, isError, isLoading, write } =
    useContractWrite(
      {
        addressOrName: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
        contractInterface: ETSTokenABI.abi,
      },
      "createTag(string,address)",
      {
        args: ["#hello", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
      }
    );

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{t("playground")} | Ethereum Tag Service</title>
      </Head>

      <PageTitle title={t("playground")} />

      <div className="space-y-8">
        <div className="lg:flex">
          <Listbox value={selected} onChange={setSelected}>
            <div className="relative w-64">
              <Listbox.Button className="relative w-full py-3 pl-4 pr-10 text-left bg-white border rounded-lg appearance-none cursor-default border-slate-300 text-slate-700 focus:outline-none focus-visible:border-pink-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-pink-500">
                <span className="block truncate">{selected.name}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg
                    className="w-6 h-6 text-slate-400"
                    aria-hidden="true"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M15.25 10.75L12 14.25L8.75 10.75"
                    />
                  </svg>
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {people.map((person, personIdx) => (
                    <Listbox.Option
                      key={personIdx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-pink-100 text-pink-600"
                            : "text-slate-700"
                        }`
                      }
                      value={person}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected
                                ? "font-medium text-pink-600"
                                : "font-normal"
                            }`}
                          >
                            {person.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-600">
                              <svg
                                className="w-6 h-6"
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M7.75 12.75L10 15.25L16.25 8.75"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
          <div className="lg:ml-3 lg:flex-shrink-0">
            <button
              onClick={() => write()}
              type="submit"
              className="flex items-center justify-center w-full px-8 py-3 text-base font-bold text-white transition-colors bg-pink-500 border border-transparent rounded-lg shadow-lg shadow-pink-500/30 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              Mint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;
