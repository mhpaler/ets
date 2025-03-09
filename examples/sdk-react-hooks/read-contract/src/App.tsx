import { useTokenClient } from "@ethereum-tag-service/sdk-react-hooks";
import { useState } from "react";

// Define chain options with explorer URLs
const CHAIN_OPTIONS = {
  ARBITRUM_SEPOLIA: {
    name: "Arbitrum Sepolia",
    id: 421614,
    exploreUrl: "https://arbitrumsepolia.app.ets.xyz/explore/ctags",
  },
  BASE_SEPOLIA: {
    name: "Base Sepolia",
    id: 84532,
    exploreUrl: "https://basesepolia.app.ets.xyz/explore/ctags",
  },
};

function App() {
  const [tagInput, setTagInput] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [checkedTags, setCheckedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedChainId, setSelectedChainId] = useState<number>(CHAIN_OPTIONS.ARBITRUM_SEPOLIA.id);

  // Get the current chain explorer URL
  const getCurrentChainExploreUrl = () => {
    return selectedChainId === CHAIN_OPTIONS.ARBITRUM_SEPOLIA.id
      ? CHAIN_OPTIONS.ARBITRUM_SEPOLIA.exploreUrl
      : CHAIN_OPTIONS.BASE_SEPOLIA.exploreUrl;
  };

  // Get tag-specific URL (for direct linking to specific tags)
  const getTagExploreUrl = (tag: string) => {
    // Remove # and encode the tag for URL
    const encodedTag = encodeURIComponent(tag.replace("#", ""));
    return `${getCurrentChainExploreUrl()}/${encodedTag}`;
  };

  const { existingTags } = useTokenClient({
    chainId: selectedChainId,
    account: "0x1234567890123456789012345678901234567890",
  });

  const checkTags = async () => {
    if (!tagInput.trim()) return;

    setIsLoading(true);
    try {
      // Make sure tag has # prefix
      const tagToCheck = tagInput.startsWith("#") ? tagInput : `#${tagInput}`;
      const tagsToCheck = [tagToCheck];

      // existingTags returns an array of tags that exist
      const existing = await existingTags(tagsToCheck);
      console.info("Existing tags:", existing);

      // Update results state
      setResults(existing);
      setCheckedTags(tagsToCheck);
    } catch (error) {
      console.error("Error checking tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleChainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedChainId(Number(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkTags();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>ETS Tag Checker</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Select Network:</h3>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="radio"
              name="chainId"
              value={CHAIN_OPTIONS.ARBITRUM_SEPOLIA.id}
              checked={selectedChainId === CHAIN_OPTIONS.ARBITRUM_SEPOLIA.id}
              onChange={handleChainChange}
              style={{ marginRight: "5px" }}
            />
            {CHAIN_OPTIONS.ARBITRUM_SEPOLIA.name}
          </label>

          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="radio"
              name="chainId"
              value={CHAIN_OPTIONS.BASE_SEPOLIA.id}
              checked={selectedChainId === CHAIN_OPTIONS.BASE_SEPOLIA.id}
              onChange={handleChainChange}
              style={{ marginRight: "5px" }}
            />
            {CHAIN_OPTIONS.BASE_SEPOLIA.name}
          </label>

          {/* Link to explore all tags on the selected network */}
          <a
            href={getCurrentChainExploreUrl()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "15px",
              color: "#4285F4",
              textDecoration: "none",
            }}
          >
            Explore all tags on this network →
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={tagInput}
            onChange={handleInputChange}
            placeholder="Enter a tag (e.g. rainbow)"
            style={{
              padding: "8px",
              width: "300px",
              marginRight: "10px",
            }}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Checking..." : "Check Tag"}
          </button>
        </div>
      </form>

      {checkedTags.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Results:</h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "15px",
              borderRadius: "5px",
            }}
          >
            <p>
              Network:{" "}
              {selectedChainId === CHAIN_OPTIONS.ARBITRUM_SEPOLIA.id
                ? CHAIN_OPTIONS.ARBITRUM_SEPOLIA.name
                : CHAIN_OPTIONS.BASE_SEPOLIA.name}
            </p>
            {checkedTags.map((tag) => (
              <div
                key={tag}
                style={{ margin: "10px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <div>
                  <strong>{tag}:</strong>{" "}
                  {results.includes(tag) ? (
                    <span style={{ color: "green" }}>Exists</span>
                  ) : (
                    <span style={{ color: "red" }}>Does not exist</span>
                  )}
                </div>
                {results.includes(tag) && (
                  <a
                    href={getTagExploreUrl(tag)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#4285F4",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                  >
                    View tag details →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
        <h3>Explore ETS Tags</h3>
        <p>Check out tag collections on different networks:</p>
        <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
          <a
            href={CHAIN_OPTIONS.ARBITRUM_SEPOLIA.exploreUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 15px",
              backgroundColor: "#E2ECFF",
              color: "#4285F4",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            {CHAIN_OPTIONS.ARBITRUM_SEPOLIA.name} Tags
          </a>
          <a
            href={CHAIN_OPTIONS.BASE_SEPOLIA.exploreUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 15px",
              backgroundColor: "#E8FBE8",
              color: "#4CAF50",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            {CHAIN_OPTIONS.BASE_SEPOLIA.name} Tags
          </a>
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        You can also check the developer console for the results.
      </p>
    </div>
  );
}

export default App;
