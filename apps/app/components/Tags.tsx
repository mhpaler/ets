import type { NextPage } from "next";
import { useMemo } from "react";
import useTranslation from "next-translate/useTranslation";
import { globalSettings } from "@app/config/globalSettings";
import { TanstackTable } from "@app/components/TanstackTable";
import { TagType } from "@app/types/tag";
import { createColumnHelper } from "@tanstack/react-table";

type Props = {
<<<<<<< HEAD
  listId: string;
=======
>>>>>>> stage
  title?: string;
  pageSize?: number;
  tags: TagType[];
  columnsConfig: any[];
  rowLink: boolean;
  pageIndex?: number;
  setPageIndex?: (index: number) => void;
  hasNextPage?: boolean;
};

<<<<<<< HEAD
const Tags: NextPage<Props> = ({ listId, title, tags, pageSize, columnsConfig, rowLink = false }) => {
  const size = pageSize ?? globalSettings["DEFAULT_PAGESIZE"];

  console.log(size);
  const { t } = useTranslation("common");
  const router = useRouter();
  const [skip, setSkip] = useState(0);

  const nextPage = () => setSkip(skip + size);
  const prevPage = () => setSkip(skip - size);

  function getValueByPath<T>(obj: T, path: string): any {
    return path.split(".").reduce<any>((acc, part) => acc && acc[part], obj);
  }

  const handleRowClick = (tagId: string) => {
    if (rowLink) {
      router.push(`/tag/${tagId}`);
    }
  };

  return (
    <div className="col-span-12">
      {title && <h2 className="text-2xl font-bold pb-4">{title}</h2>}
      <Table loading={!tags} rows={size}>
        <Table.Head>
          <Table.Tr>
            {columnsConfig.map((column) => (
              <Table.Th key={column.title}>{t(column.title)}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Head>

        <Table.Body>
          {tags?.map((tag) => (
            <Table.Tr key={tag.id} onClick={rowLink ? () => handleRowClick(tag.id) : undefined}>
              {columnsConfig.map((column) => (
                <Table.Cell key={column.field}>
                  {column.formatter
                    ? column.formatter(getValueByPath(tag, column.field), tag) // Pass the whole tag object
                    : getValueByPath(tag, column.field)}
                </Table.Cell>
              ))}
            </Table.Tr>
          ))}
        </Table.Body>
        {/* {nextTags?.length > 0 || skip !== 0 ? (
          <Table.Footer>
            <tr>
              <td className="flex justify-between">
                <Button disabled={skip === 0} onClick={prevPage}>
                  {t("prev")}
                </Button>
                <Button disabled={!nextTags || nextTags.length === 0} onClick={nextPage}>
                  {t("next")}
                </Button>
              </td>
            </tr>
          </Table.Footer>
        ) : null} */}
      </Table>
=======
const Tags: NextPage<Props> = ({
  title,
  tags,
  pageSize = globalSettings["DEFAULT_PAGESIZE"],
  columnsConfig,
  rowLink,
  pageIndex,
  setPageIndex,
  hasNextPage,
}) => {
  const { t } = useTranslation("common");

  const columnHelper = createColumnHelper<TagType>();

  const columns = useMemo<any[]>(
    () =>
      columnsConfig.map((column) =>
        columnHelper.accessor(column.field, {
          header: () => t(column.title),
          cell: (info) => {
            const tag = info.row.original;
            return column.formatter ? column.formatter(info.getValue(), tag) : info.getValue();
          },
        }),
      ),
    [columnsConfig, t],
  );

  return (
    <div className="col-span-12">
      <TanstackTable
        columns={columns}
        data={tags}
        hasNextPage={hasNextPage}
        loading={!tags?.length}
        rowsPerPage={pageSize}
        title={title}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        rowLink={rowLink ? (tag: TagType) => `/tag/${tag.id}` : undefined}
      />
>>>>>>> stage
    </div>
  );
};

export { Tags };
