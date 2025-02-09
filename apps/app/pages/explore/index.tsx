import { AuctionIcon, Playground, Relayer, Tag, TaggingRecord, Target, Users } from "@app/components/icons";
import Layout from "@app/layouts/default";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";

const Explore: NextPage = () => {
  const { t } = useTranslation("common");
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

  return (
    <Layout>
      <div className="col-span-10">
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
              Learn more about ETS <strong>key concepts</strong> in the{" "}
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

export default Explore;
