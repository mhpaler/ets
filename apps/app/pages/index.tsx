import SiteMessage from "@app/components/SiteMessage";
import { Stats } from "@app/components/Stats";
import { TaggingRecords } from "@app/components/TaggingRecords";
import { AuctionIcon, Playground, Relayer, Tag, TaggingRecord, Target, Users } from "@app/components/icons";
import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import Layout from "@app/layouts/default";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  const { isIndexPage } = useEnvironmentContext();
  const cardsData = [
    {
      slug: "tagging-records",
      titleKey: "tagging-records",
      Icon: TaggingRecord,
    },
    {
      slug: "ctags",
      titleKey: "CTAGs",
      Icon: Tag,
    },
    {
      slug: "targets",
      titleKey: "targets",
      Icon: Target,
    },
    {
      slug: "relayers",
      titleKey: "relayers",
      Icon: Relayer,
    },
    {
      slug: "taggers",
      titleKey: "taggers",
      Icon: Users,
    },
    {
      slug: "creators",
      titleKey: "creators",
      Icon: Users,
    },
    {
      slug: "owners",
      titleKey: "owners",
      Icon: Users,
    },
    {
      slug: "auction",
      titleKey: "auction",
      Icon: AuctionIcon,
    },
    {
      slug: "playground",
      titleKey: "playground",
      Icon: Playground,
    },
  ];

  if (isIndexPage) {
    return (
      <div className="flex items-center justify-center h-screen px-6">
        <main className="max-w-sm py-6 my-auto space-y-6">
          <div className="flex items-center justify-center mt-10 mb-14">
            <svg className="w-8 h-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <title>ETS Logo</title>
              <path
                fill="currentColor"
                d="M0 50 50 0H0v50zm100 50V50l-50 50h50zM50 0l50 50V0H50zM19.9 84.9c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.3 5 5z"
              />
            </svg>
            <span className="hidden md:inline-flex ml-2.5 text-3xl font-medium text-slate-900">ETS</span>
            <span className="ml-2 font-thin">explorer</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Layout>
      <div className="mb-8 col-span-12">
        <SiteMessage />
      </div>
      <div className="col-span-12 mb-8">
        <Stats />
      </div>
      <TaggingRecords title={t("latest-tagging-records")} />

      <div className="col-span-12 mt-8">
        <h2 className="text-2xl font-medium pb-4">Explore ETS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cardsData.map((card, index) => {
            const IconComponent = card.Icon;
            return (
              <a key={index} href={`/explore/${card.slug}`} className="block">
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                  <IconComponent size={48} />
                  <span className="mt-4 text-lg font-semibold">{t(card.titleKey)}</span>
                </div>
              </a>
            );
          })}
        </div>
        <div role="alert" className="alert shadow-sm mt-10 mb-10 flex items-center justify-between">
          <div>
            <div className="text-sm">
              Learn more about <strong>ETS key concepts</strong> in the{" "}
              <a
                href="https://ets.xyz/docs/concepts/overview"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                documentation
              </a>
            </div>
          </div>
          <a
            href="https://ets.xyz/docs/concepts/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary btn-outline"
          >
            View docs
          </a>
        </div>
      </div>
    </Layout>
  );
};
export default Home;
