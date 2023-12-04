import { useAddRelayer } from "../../../hooks/useAddRelayer";

const Confirm = () => {
  const context = useAddRelayer();

  if (!context) {
    // Handle the case when context is undefined
    return null;
  }

  const { data } = context;

  const content = (
    <>
      <div className="overflow-x-auto">
        <p className="mt-4 text-center pl-8 pr-8">
          <span className="flex justify-center items-center">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M19.25 8.25V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 13C16.5 13.2761 16.2761 13.5 16 13.5C15.7239 13.5 15.5 13.2761 15.5 13C15.5 12.7239 15.7239 12.5 16 12.5C16.2761 12.5 16.5 12.7239 16.5 13Z"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17.25 8.25H6.5C5.5335 8.25 4.75 7.4665 4.75 6.5C4.75 5.5335 5.5335 4.75 6.5 4.75H15.25C16.3546 4.75 17.25 5.64543 17.25 6.75V8.25ZM17.25 8.25H19.25"
              ></path>
            </svg>
          </span>
          Double check these details before confirming in your wallet.
        </p>
        <div className="flex flex-col w-full mt-8 mb-4 gap-4">
          <div className="flex flex-row justify-between h-16 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">Name</div>
            <div className="font-bold">{data.name}</div>
          </div>
          <div className="flex flex-row justify-between h-16 items-center pl-6 pr-6 rounded-box border-2 border-base-300">
            <div className="">Action</div>
            <div className="font-bold">Create Relayer</div>
          </div>
        </div>
      </div>
    </>
  );

  return content;
};
export { Confirm };
