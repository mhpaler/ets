import type React from "react";
import { useEffect } from "react";

/**
 * Test component to verify console statement stripping in production builds
 * This component should have console statements visible in development
 * but stripped out in production builds
 */
export const ConsoleTestComponent: React.FC = () => {
  useEffect(() => {
    // These console statements should be stripped in production
    console.log("ConsoleTestComponent: This should be stripped in production");
    console.info("ConsoleTestComponent: Info message - should be stripped");
    console.warn("ConsoleTestComponent: Warning message - should be stripped");
    console.error("ConsoleTestComponent: Error message - should be stripped");
    console.debug("ConsoleTestComponent: Debug message - should be stripped");

    // Test different console patterns
    console.log("Multiple", "arguments", "should", "be", "stripped");
    console.log({ data: "object", value: 123 });

    if (typeof window !== "undefined") {
      console.log("Client-side console statement");
    }

    // This will remain as it's not a direct console call
    const logMessage = () => console.log("Function call - should be stripped");
    logMessage();
  }, []);

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", margin: "1rem" }}>
      <h3>Console Test Component</h3>
      <p>Check the browser console:</p>
      <ul>
        <li>
          <strong>Development:</strong> Should see console messages
        </li>
        <li>
          <strong>Production:</strong> Should NOT see console messages
        </li>
      </ul>
      <p>
        Current NODE_ENV: <code>{process.env.NODE_ENV}</code>
      </p>
    </div>
  );
};
