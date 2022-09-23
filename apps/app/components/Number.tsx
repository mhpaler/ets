import useNumberFormatter from '../hooks/useNumberFormatter';

const Number = ({ value }: { value: number }) => {
  const { number } = useNumberFormatter();
  return <>{number(value)}</>;
}

export { Number };
