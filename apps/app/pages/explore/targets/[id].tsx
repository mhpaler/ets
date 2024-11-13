import Address from "@app/components/Address";
import { CopyAndPaste } from "@app/components/CopyAndPaste";
import { Panel } from "@app/components/Panel";
import { URI } from "@app/components/URI";
import { useTargets } from "@app/hooks/useTargets";
import Layout from "@app/layouts/default";
import { timestampToString } from "@app/utils";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";

const Target: NextPage = () => {
  const { query } = useRouter();
  const { id } = query;
  const { t } = useTranslation("common");
  const { targets } = useTargets({
    pageSize: 1,
    skip: 0,
    filter: { id },
  });

  const target = targets?.[0];

  return (
    <Layout>
      <div className="col-span-12">
        {target && (
          <div className="grid gap-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-1">
            <div className="grid content-start w-full gap-6 mx-auto lg:gap-12 text-sm">
              <Panel title={t("overview")}>
                <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("id")}</div>
                  <div className=" col-span-2 text-left">
                    <Address address={targets?.[0].id} addressType="long-id" />
                  </div>
                </div>

                <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("created")}</div>
                  <div className=" col-span-2 text-left">
                    {targets && timestampToString(Number.parseInt(targets[0].created))}
                  </div>
                </div>

                <div className="grid grid-cols-3 px-6 py-4 md:grid-flow-col hover:bg-slate-100">
                  <div className="font-semibold">{t("URI")}</div>
                  <div className="flex col-span-2 justify-start">
                    <Address
                      address={targets?.[0].targetURI}
                      addressType="url"
                      href={targets?.[0].targetURI}
                      explorerLink={false}
                    />
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Target;
