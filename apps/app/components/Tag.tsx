import Link from "next/link";

const Tag = ({ tag }: { tag: any }) => {
  return (
    <Link href={`/tags/${tag.machineName}`}>
      <a className="text-sm font-semibold inline-block py-1 px-2 rounded text-pink-600 bg-pink-200 last:mr-0 mr-1">
        {tag.display}
      </a>
    </Link>
  );
};

export { Tag };
