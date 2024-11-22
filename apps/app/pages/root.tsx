// pages/root.tsx
import Link from "next/link";

const RootPage = () => {
  //const router = useRouter();
  const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Welcome to Ethereum Tag Service</h1>
        <p className="mb-6">Please select a network to continue:</p>
        <div className="space-y-4">
          <Link
            href={isLocalhost ? "http://arbitrumsepolia.localhost:3000" : "https://app.arbitrumsepolia.ets.xyz"}
            className="block w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
          >
            Arbitrum Sepolia
          </Link>
          <Link
            href={isLocalhost ? "http://basesepolia.localhost:3000" : "https://app.basesepolia.ets.xyz"}
            className="block w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 text-center"
          >
            Base Sepolia
          </Link>
          {isLocalhost && (
            <Link
              href="http://hardhat.localhost:3000"
              className="block w-full py-2 px-4 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-center"
            >
              Hardhat (Local Development)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RootPage;
