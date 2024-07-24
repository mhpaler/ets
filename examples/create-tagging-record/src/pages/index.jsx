import React from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";

const TaggingRecordForm = dynamic(() => import("../components/TaggingRecordForm"), {
  ssr: false,
});

function App() {
  const { isConnected } = useAccount();

  return (
    <div>
      <h1>Create Tagging Record</h1>
      {isConnected ? <TaggingRecordForm /> : <ConnectButton />}
    </div>
  );
}

export default App;
