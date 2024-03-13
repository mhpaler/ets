import { Tag } from "@app/types/tag";

// Define the TagGraphicProps type to include a tag of type Tag
interface TagGraphicProps {
  tag: Tag;
}
const TagGraphic: React.FC<TagGraphicProps> = (props: TagGraphicProps) => {
  const { tag } = props;

  return (
    <>
      <div className="overflow-hidden shadow-xl rounded-xl shadow-slate-300">
        <svg
          className="w-full h-auto text-white bg-gradient-to-tr from-teal-500 via-purple-500 to-pink-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1000"
        >
          <path fill="currentColor" d="m100 775 125-125H100Zm250 125V775L225 900ZM225 650l125 125V650Z" />
          <circle fill="currentColor" cx="137.36" cy="862.38" r="12.5" />
          <text
            fill="currentColor"
            stroke="none"
            strokeMiterlimit="10"
            fontFamily="HelveticaNeue-Bold,Helvetica Neue"
            fontSize="50"
            fontWeight="700"
            transform="translate(100 150)"
          >
            {tag.display != null ? tag.display : "no tag found"}
          </text>
        </svg>
      </div>
    </>
  );
};

export { TagGraphic };
