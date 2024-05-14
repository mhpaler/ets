import Link from "next/link";
import { TagType } from "@app/types/tag";
const Tag = ({ tag }: { tag: TagType }) => {
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
