import useTranslation from 'next-translate/useTranslation';
import { numberFormatters } from '../i18n';

const Number = ({ value }: { value: number }) => {
  const { lang } = useTranslation();

  return <>{numberFormatters[lang].format(value)}</>;
}

export { Number };
