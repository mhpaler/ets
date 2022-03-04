import TimeAgoComponent from 'react-timeago';
import useTranslation from 'next-translate/useTranslation';
import { timeagoFormatters } from '../i18n';

const TimeAgo = ({ date }: { date: string|Date|number }) => {
  const { lang } = useTranslation();

  return <TimeAgoComponent date={date} formatter={timeagoFormatters[lang]} />;
}

export { TimeAgo };
