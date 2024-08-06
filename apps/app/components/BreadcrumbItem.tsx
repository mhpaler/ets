import { usePathToTitle } from "@app/hooks/usePathToTitle";

interface BreadcrumbItemProps {
  breadcrumb: string;
}

const BreadcrumbItem = ({ breadcrumb }: BreadcrumbItemProps) => {
  const { label, loading } = usePathToTitle(breadcrumb);

  return <span className="flex">{loading ? <div className="loading loading-spinner loading-md" /> : label}</span>;
};

export { BreadcrumbItem };
