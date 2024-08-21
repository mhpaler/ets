import useTranslation from "next-translate/useTranslation";
import TimeAgoComponent from "react-timeago";
import { timeagoFormatters } from "../i18n";

const TimeAgo = ({ date }: { date: string | Date | number }) => {
  const { lang } = useTranslation();

  return (
    <span className="whitespace-nowrap">
      <TimeAgoComponent date={date} formatter={timeagoFormatters[lang as keyof typeof timeagoFormatters]} />
    </span>
  );
};

export { TimeAgo };
