import type { TagType } from "@app/types/tag";
import Link from "next/link";

interface TagProps {
  tag?: TagType; // Allow tag to be undefined
}

const Tag: React.FC<TagProps> = ({ tag }) => {
  if (!tag) {
    return <div>No Tag Available</div>;
  }
  return (
    <Link
      href={`/explore/tags/${tag.machineName}`}
      className="text-sm font-medium inline-block py-1 px-2 rounded link-primary bg-primary-content last:mr-0 mr-1"
    >
      {tag.display}
    </Link>
  );
};

export { Tag };
