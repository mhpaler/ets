import { useMemo } from "react";
import useTranslation from 'next-translate/useTranslation';
import { numberFormatters } from '../i18n';

export default function useNumberFormatter() {
  const { lang } = useTranslation();
  return {
    number: useMemo(() => (value: number) => numberFormatters[lang].format(value), [lang])
  };
}
