import type { NextPage } from "next";
import { FeaturedAuction } from "../components/FeaturedAuction";

const Home: NextPage = () => {
  return (
    <div className="max-w-7xl mx-auto mt-12 md:space-y-0 sm:w-full">
      <FeaturedAuction />
    </div>
  );
};

export default Home;
