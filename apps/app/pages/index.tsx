import type { NextPage } from 'next';
import { RecentlyTagged } from '../components/RecentlyTagged';
import { NewestTags } from '../components/NewestTags';
import { TopCreators } from '../components/TopCreators';
import { TopPublishers } from '../components/TopPublishers';
import { TopTaggers } from '../components/TopTaggers';
import { PopularTags } from '../components/PopularTags';
import { Stats } from '../components/Stats';
import { FeaturedAuction } from '../components/FeaturedAuction';

const Home: NextPage = () => {
  return (
    <div className="max-w-6xl mx-auto mt-12 md:space-y-0 sm:w-full">
      <FeaturedAuction />
    </div>
  );
}

export default Home;
