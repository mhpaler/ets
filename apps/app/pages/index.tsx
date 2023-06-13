import type { NextPage } from "next";
import { TaggingRecords } from "../components/TaggingRecords";
import useTranslation from "next-translate/useTranslation";
import { Stats } from "../components/Stats";
// import Image from 'next/image';

// import Greeter from '../src/artifacts/contracts/Greeter.sol/Greeter.json';
// use it like this:
// const contract = new ethers.Contract(process.env.NEXT_PUBLIC_GREETER_ADDRESS, Greeter.abi, provider)

// import { Button } from "@ethereum-tag-service/ui"; // example of how to pull in UI

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  return (
    <div className="grid max-w-6xl gap-6 mx-auto mt-12 lg:gap-12 md:space-y-0 sm:w-full">
      <Stats />
      <div className="gap-6 md:grid-cols-1 lg:gap-12">
        <TaggingRecords title={t("latest-tagging-records")} />
      </div>
    </div>
  );
};

export default Home;
