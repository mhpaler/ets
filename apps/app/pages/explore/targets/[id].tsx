import type { NextPage } from "next";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { useTargets } from "@app/hooks/useTargets";
import { timestampToString } from "@app/utils";
import Layout from "@app/layouts/default";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Panel } from "@app/components/Panel";
import { URI } from "@app/components/URI";

const Target: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { t } = useTranslation("common");
  const { targets } = useTargets({
    pageSize: 1,
    skip: 0,
    filter: { id },
    orderBy: "created",
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  return (
    <Layout>
      <div className="col-span-12">
        <div className="grid gap-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-1">
          <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
            <Panel title={t("overview")}>
              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("id")}</div>
                <div className=" col-span-2 text-left truncate">{targets && targets[0].id}</div>
              </div>

              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("created")}</div>
                <div className=" col-span-2 text-left">
                  {targets && timestampToString(parseInt(targets[0].created))}
                </div>
              </div>

              <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                <div className="font-semibold">{t("URI")}</div>
                <div className="flex space-x-1 col-span-2 justify-start">
                  <div className=" truncate">{targets && targets[0].targetURI}</div>
                  <CopyAndPaste value={targets && targets[0].targetURI} />
                  <URI value={targets && targets[0].targetURI} />
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Target;
