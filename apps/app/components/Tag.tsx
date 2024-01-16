import Link from "next/link";

const Tag = ({ tag }: { tag: any }) => {
  return (
    <Link
      href={`/tags/${tag.machineName}`}
      className="text-sm font-medium inline-block py-1 px-2 rounded link-primary bg-primary-content last:mr-0 mr-1"
    >
      {tag.display}
    </Link>
  );
};

export { Tag };
