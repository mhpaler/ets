import Link from "next/link";
import { useEffect, useState } from "react";

interface ChainModalETSProps {
  show: boolean;
  onClose: () => void;
}

const ChainModalETS: React.FC<ChainModalETSProps> = ({ show, onClose }) => {
  const [environment, setEnvironment] = useState<"localhost" | "staging" | "production">("production");

  useEffect(() => {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
      setEnvironment("localhost");
    } else if (hostname.includes(".stage.app.ets.xyz")) {
      setEnvironment("staging");
    } else if (hostname.includes(".app.ets.xyz")) {
      setEnvironment("production");
    }
  }, []);

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-96">
        <h2 className="font-bold text-xl mb-4">Select a Network</h2>
        <div className="space-y-4">
          {/* Localhost buttons, shown only on localhost */}
          {environment === "localhost" && (
            <div className="card bg-base-200 w-full shadow-md">
              <div className="card-body">
                <h2 className="card-title">Localhost</h2>
                <ul className="space-y-4">
                  <li>
                    <Link className="btn btn-primary btn-outline w-full" href="http://arbitrumsepolia.localhost:3000">
                      Arbitrum Sepolia
                    </Link>
                  </li>
                  <li>
                    <Link className="btn btn-primary btn-outline w-full" href="http://basesepolia.localhost:3000">
                      Base Sepolia
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Staging buttons, shown on staging and localhost */}
          {(environment === "staging" || environment === "localhost") && (
            <div className="card bg-base-200 w-full shadow-md">
              <div className="card-body">
                <h2 className="card-title">Stage</h2>
                <ul className="space-y-4">
                  <li>
                    <Link
                      className="btn btn-primary btn-outline w-full"
                      href="https://arbitrumsepolia.stage.app.ets.xyz"
                    >
                      Arbitrum Sepolia
                    </Link>
                  </li>
                  <li>
                    <Link className="btn btn-primary btn-outline w-full" href="https://basesepolia.stage.app.ets.xyz">
                      Base Sepolia
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Production buttons, shown on production, staging, and localhost */}
          {(environment === "production" || environment === "staging" || environment === "localhost") && (
            <div className="card bg-base-200 w-full shadow-md">
              <div className="card-body">
                <h2 className="card-title">Main</h2>
                <ul className="space-y-4">
                  <li>
                    <Link className="btn btn-primary btn-outline w-full" href="https://arbitrumsepolia.app.ets.xyz">
                      Arbitrum Sepolia
                    </Link>
                  </li>
                  <li>
                    <Link className="btn btn-primary btn-outline w-full" href="https://basesepolia.app.ets.xyz">
                      Base Sepolia
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainModalETS;
