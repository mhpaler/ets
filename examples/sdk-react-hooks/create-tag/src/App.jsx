import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import CreateTagForm from "./components/CreateTagForm";

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="App">
      <h1>Create Tag</h1>
      {isConnected ? <CreateTagForm /> : <ConnectButton />}
    </div>
  );
}

export default App;
