import { useEnvironmentContext } from "@app/context/EnvironmentContext";
import { useState } from "react";

// Debug panel that can be toggled to show environment details
function EnvironmentDebugPanel() {
  const { network, serverEnvironment } = useEnvironmentContext();
  const [showDebug, setShowDebug] = useState(false);
  
  // Only show on localhost or staging environments
  const isOnLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname.endsWith('.localhost')
  );
  
  const isStaging = typeof window !== 'undefined' && (
    window.location.hostname.includes('stage.app.ets.xyz') ||
    window.location.hostname.includes('vercel.app')
  );
  
  // Don't show in production
  if (!isOnLocalhost && !isStaging) {
    return null;
  }
  
  const toggleDebug = () => setShowDebug(!showDebug);
  
  // Calculate SDK contract key and mapped network
  const chainId = network === 'hardhat' ? '31337' : 
                 network === 'arbitrumsepolia' || network === 'arbitrumsepoliastaging' ? '421614' : 
                 network === 'basesepolia' || network === 'basesepoliastaging' ? '84532' : 'unknown';
                 
  const sdkContractKey = `${chainId}_${serverEnvironment}`;
  
  const mappedNetwork = serverEnvironment === 'staging' ? 
                      network === 'arbitrumsepolia' ? 'arbitrumsepoliastaging' :
                      network === 'basesepolia' ? 'basesepoliastaging' : network
                      : network;
  
  return (
    <div className="fixed bottom-2 right-2 z-50">
      <button 
        onClick={toggleDebug}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-2 rounded text-xs"
      >
        {showDebug ? "Hide Debug" : "Show Debug"}
      </button>
      
      {showDebug && (
        <div className="mt-2 p-3 border border-gray-300 rounded-md bg-gray-100 text-xs font-mono shadow-lg max-w-xs">
          <h3 className="font-bold mb-2">Environment Debug</h3>
          <div className="grid grid-cols-2 gap-1">
            <div className="font-semibold">Hostname:</div>
            <div>{typeof window !== 'undefined' ? window.location.hostname : 'server-side'}</div>
            
            <div className="font-semibold">Current Network:</div>
            <div className="text-blue-600">{network}</div>
            
            <div className="font-semibold">Environment:</div>
            <div className="text-green-600">{serverEnvironment}</div>
            
            <div className="font-semibold">Chain ID:</div>
            <div>{chainId}</div>
                  
            <div className="font-semibold">SDK Contract Key:</div>
            <div className="text-red-600">{sdkContractKey}</div>
            
            <div className="font-semibold">Mapped Network:</div>
            <div className="text-purple-600">{mappedNetwork}</div>
            
            <div className="font-semibold">URL:</div>
            <div className="truncate">{typeof window !== 'undefined' ? window.location.href : ''}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="p-4 lg:p-10">
      <div className="mx-auto md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="https://github.com/ethereum-tag-service/ets" className=" hover:text-slate-500">
            <span className="sr-only" />
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <title>GitHub</title>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
          <a href="https://twitter.com/etsxyz" className=" hover:text-slate-500">
            <span className="sr-only" />
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <title>Twitter</title>
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
          </a>
        </div>
        <div className="mt-4 md:mt-0 md:order-1">
          <p className="text-center text-sm">© 2021-{new Date().getUTCFullYear()} Ethereum Tag Service</p>
        </div>
      </div>
      
      {/* Environment debug panel - only visible in development */}
      <EnvironmentDebugPanel />
    </footer>
  );
};
export default Footer;
