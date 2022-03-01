import copyToClipboard from "copy-to-clipboard";
import { useState, useCallback, useEffect } from 'react';

export default function useCopyToClipboard(resetInterval = 3000) {
  const [isCopied, setCopied] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isCopied && resetInterval) {
      timeout = setTimeout(() => setCopied(false), resetInterval);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied, resetInterval]);

  const copy = useCallback((value: string | number) => {
    if (typeof value === "string" || typeof value == "number") {
      copyToClipboard(value.toString());
      setCopied(true);
    } else {
      setCopied(false);
      console.error(
        `Cannot copy typeof ${typeof value} to clipboard, must be a string or number.`
      );
    }
  }, []);

  return [
    isCopied,
    copy,
  ] as const;
}
