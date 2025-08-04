import type { Environment } from "@ethereum-tag-service/sdk-core";
import { useTokenClient } from "@ethereum-tag-service/sdk-react-hooks";
import { useState } from "react";

// Environment options
const ENVIRONMENT_OPTIONS = {
  staging: {
    name: "Staging",
    description: "Test environment for development",
  },
  production: {
    name: "Production",
    description: "Live production environment",
  },
} as const;

const EXPLORE_BASE_URL = "https://app.ets.xyz/explore/ctags";

function App() {
  const [tagInput, setTagInput] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [checkedTags, setCheckedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment>("production");

  // Get tag-specific URL (for direct linking to specific tags)
  const getTagExploreUrl = (tag: string) => {
    // Remove # and encode the tag for URL
    const encodedTag = encodeURIComponent(tag.replace("#", ""));
    return `${EXPLORE_BASE_URL}/${encodedTag}`;
  };

  const { existingTags } = useTokenClient({
    chainId: 84532, // Base Sepolia
    account: "0x1234567890123456789012345678901234567890",
    environment: selectedEnvironment,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkTags();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>ETS Tag Checker</h1>

      <div style={{ marginBottom: "20px" }}>
        <h3>Environment Selection</h3>
        <div style={{ marginBottom: "15px" }}>
          {Object.entries(ENVIRONMENT_OPTIONS).map(([env, config]) => (
            <label key={env} style={{ display: "block", margin: "8px 0" }}>
              <input
                type="radio"
                name="environment"
                value={env}
                checked={selectedEnvironment === env}
                onChange={(e) => setSelectedEnvironment(e.target.value as Environment)}
                style={{ marginRight: "8px" }}
              />
              <strong>{config.name}</strong> - {config.description}
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <a
            href={EXPLORE_BASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#4285F4",
              textDecoration: "none",
            }}
          >
            Explore all tags →
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
            <p>Environment: {ENVIRONMENT_OPTIONS[selectedEnvironment as keyof typeof ENVIRONMENT_OPTIONS].name}</p>
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
        <p>Check out the complete tag collection in the selected environment:</p>
        <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
          <a
            href={EXPLORE_BASE_URL}
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
            {ENVIRONMENT_OPTIONS[selectedEnvironment as keyof typeof ENVIRONMENT_OPTIONS].name} Tags
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
