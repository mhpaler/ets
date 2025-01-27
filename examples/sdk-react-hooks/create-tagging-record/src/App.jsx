import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";
import { useAccount } from "wagmi";
import TaggingRecordForm from "./components/TaggingRecordForm";

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
