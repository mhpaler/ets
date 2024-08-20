import React from "react";
import useNumberFormatter from "../hooks/useNumberFormatter";

const FormattedNumber = ({ value }: { value: number }) => {
  const { number } = useNumberFormatter();
  return <>{number(value)}</>;
};

export { FormattedNumber };
