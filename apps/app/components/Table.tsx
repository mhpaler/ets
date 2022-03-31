import { Table as ReactTable, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import Link from 'next/link';
import { Number } from '../components/Number';
import { TimeAgo } from '../components/TimeAgo';
import { CopyAndPaste } from '../components/CopyAndPaste';

interface Table {
  title: string,
  columns: string[]
  data: any,
}

const Table = ({
  title,
  columns,
  data,
}: Table) => {
  return (
    <div className="-mx-4 shadow-lg lg:rounded-md lg:mx-0 ring-1 ring-slate-200 ring-opacity-100 shadow-slate-300/20">
      <h2 className="px-6 py-3 font-semibold text-left text-slate-700">{title}</h2>
      <ReactTable>
        <Thead>
          <Tr>
            {columns.map(map => <Th key={map}>{map}</Th>)}
          </Tr>
        </Thead>

        <Tbody>
          {data && data.tags.map((tag: any) => (
            <Tr key={tag.id}>
              <Td>
                <div className="flex md:min-w-[100px] lg:max-w-[200px] col-span-3 space-x-2">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="overflow-hidden text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link href={`/tags/${tag.hashtagWithoutHash}`}>
                        <a className="text-pink-600 hover:text-pink-700">{tag.name}</a>
                      </Link>
                    </div>
                  </div>
                </div>
              </Td>
              <Td>
                <div className="grid col-span-3 min-w-[80px]">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <TimeAgo date={tag.timestamp * 1000} />
                  </div>
                </div>
              </Td>
              <Td>
                <div className="flex lg:max-w-[200px] col-span-3 space-x-2">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link href={`/creator/${tag.creator}`}>
                        <a className="text-pink-600 hover:text-pink-700">{tag.creator}</a>
                      </Link>
                    </div>
                  </div>
                  <CopyAndPaste value={tag.creator} />
                </div>
              </Td>
              <Td>
                <div className="flex lg:max-w-[200px] col-span-3 space-x-2">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link href={`/owner/${tag.owner}`}>
                        <a className="text-pink-600 hover:text-pink-700">{tag.owner}</a>
                      </Link>
                    </div>
                  </div>
                  <CopyAndPaste value={tag.owner} />
                </div>
              </Td>
              <Td>
                <div className="flex lg:max-w-[200px] col-span-3 space-x-2">
                  <div className="grid flex-grow grid-cols-1 md:grid-flow-col">
                    <div className="overflow-hidden text-right text-pink-600 hover:text-pink-700 text-ellipsis whitespace-nowrap">
                      <Link href={`/publisher/${tag.publisher}`}>
                        <a className="text-pink-600 hover:text-pink-700">{tag.publisher}</a>
                      </Link>
                    </div>
                  </div>
                  <CopyAndPaste value={tag.publisher} />
                </div>
              </Td>
              <Td>
                <div className="col-span-3 text-right">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <Number value={tag.tagCount} />
                  </div>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </ReactTable>
    </div>
  );
}

export { Table };
