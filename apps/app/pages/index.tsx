import type { NextPage } from "next";
import { RecentlyTagged } from "../components/RecentlyTagged";
import { Stats } from "../components/Stats";
// import Image from 'next/image';

// import Greeter from '../src/artifacts/contracts/Greeter.sol/Greeter.json';
// use it like this:
// const contract = new ethers.Contract(process.env.NEXT_PUBLIC_GREETER_ADDRESS, Greeter.abi, provider)

// import { Button } from "@ethereum-tag-service/ui"; // example of how to pull in UI

const Home: NextPage = () => {
  return (
    <div className="grid max-w-6xl gap-6 mx-auto mt-12 lg:gap-12 md:space-y-0 sm:w-full">
      <Stats />
      <div className="grid gap-6 md:grid-cols-1 lg:gap-12">
        <RecentlyTagged />
      </div>
    </div>
  );
};

export default Home;
