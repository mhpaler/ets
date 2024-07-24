import { useState, useEffect } from "react";

function useRelayers() {
  const [relayers, setRelayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelayers = async () => {
      try {
        // fix
        const response = await fetch("https://api.yourgraphqlendpoint.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query {
                relayers(first: 20, orderBy: firstSeen, orderDirection: desc) {
                  id
                  name
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setRelayers(data.data.relayers);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelayers();
  }, []);

  return { relayers, isLoading, error };
}

export { useRelayers };
