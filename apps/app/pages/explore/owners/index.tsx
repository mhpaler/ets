import Address from "@app/components/Address";
import { TanstackTable } from "@app/components/TanstackTable";
import { TimeAgo } from "@app/components/TimeAgo";
import { useCurrentChain } from "@app/hooks/useCurrentChain";
import useNumberFormatter from "@app/hooks/useNumberFormatter";
import { useOwners } from "@app/hooks/useOwners";
import Layout from "@app/layouts/default";
import { toEth } from "@app/utils";
import { createColumnHelper } from "@tanstack/react-table";
import type { NextPage } from "next";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import { useMemo, useState } from "react";

const pageSize = 20;

type OwnerType = {
  id: string;
  firstSeen: string;
  tagsOwned: string;
  ownedTagsTaggingFeeRevenue: string;
  ens: string | null;
};

const Owners: NextPage = () => {
  const { t } = useTranslation("common");
  const [pageIndex, setPageIndex] = useState(0);
  const { number } = useNumberFormatter();
  const chain = useCurrentChain();
  const { owners: rawOwners, nextOwners } = useOwners({
    pageSize,
    skip: pageIndex * pageSize,
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
    },
  });

  const owners = useMemo(() => {
    return (rawOwners || []).filter((owner) => owner.id !== "0x0000000000000000000000000000000000000000");
  }, [rawOwners]);

  const columnHelper = createColumnHelper<OwnerType>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => t("owner"),
        cell: (info) => (
          <Link href={`/explore/owners/${info.getValue()}`} className="link link-primary">
            <Address address={info.getValue()} ens={info.row.original.ens} />
          </Link>
        ),
      }),
      columnHelper.accessor("firstSeen", {
        header: () => t("first-seen"),
        cell: (info) => <TimeAgo date={Number(info.getValue()) * 1000} />,
      }),
      columnHelper.accessor("tagsOwned", {
        header: () => t("tags-owned", { timeframe: t("current") }),
        cell: (info) => number(Number(info.getValue())),
      }),
      columnHelper.accessor("ownedTagsTaggingFeeRevenue", {
        header: () => t("tagging-revenue"),
        cell: (info) => `${toEth(Number(info.getValue()), 8)} ${chain?.nativeCurrency.symbol}`,
      }),
    ],
    [t, number, chain?.nativeCurrency.symbol, columnHelper],
  );

  return (
    <Layout>
      <TanstackTable
        columns={columns}
        data={owners}
        loading={!owners?.length}
        rowsPerPage={pageSize}
        hasNextPage={!!nextOwners?.length}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        rowLink={(owner: OwnerType) => `/explore/owners/${owner.id}`}
      />
    </Layout>
  );
};

export default Owners;
