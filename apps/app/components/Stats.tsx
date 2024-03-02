import { useStats } from "@app/hooks/useStats";
import useTranslation from "next-translate/useTranslation";

const Stats = () => {
  const { stats } = useStats({
    config: {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 1000,
    },
  });

  const { t } = useTranslation("common");

  return (
    <section className="stats stats-vertical col-span-12 w-full shadow-sm xl:stats-horizontal">
      <a href="/tagging-records" className="hover:bg-slate-300">
        <div className="stat">
          <div className="stat-title">{t("tagging-records")}</div>
          <div className="stat-value">{stats && stats.taggingRecordsCount ? stats.taggingRecordsCount : null}</div>
          <div className="stat-desc">21% more than last month</div>
        </div>
      </a>
      <a href="/tags" className="hover:bg-slate-300">
        <div className="stat">
          <div className="stat-title">{t("tags")}</div>
          <div className="stat-value">{stats && stats.tagsCount ? stats.tagsCount : null}</div>
          <div className="stat-desc">21% more than last month</div>
        </div>
      </a>
      <a href="/relayers" className="hover:bg-slate-300">
        <div className="stat">
          <div className="stat-title">{t("relayers")}</div>
          <div className="stat-value">{stats && stats.relayerCountActive ? stats.relayerCountActive : null}</div>
          <div className="stat-desc">21% more than last month</div>
        </div>
      </a>
      <a href="/tagging-records" className="hover:bg-slate-300">
        <div className="stat">
          <div className="stat-title">{t("taggers")}</div>
          <div className="stat-value">{stats && stats.taggerCount ? stats.taggerCount : null}</div>
          <div className="stat-desc">21% more than last month</div>
        </div>
      </a>
    </section>
  );
};

export { Stats };
