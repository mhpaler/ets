/**
 * Determines the environment based on either a chain ID or a subdomain.
 * This function is used to map chain IDs or subdomains to specific environments
 * used in the Ethereum Tag Service (ETS) application.
 *
 * @param input - Can be either a string (subdomain or chain ID) or a number (chain ID)
 * @returns A string representing the environment ('arbitrumsepolia', 'basesepolia', or 'localhost')
 *
 * @example
 * getEnvironment('421614') // returns 'arbitrumsepolia'
 * getEnvironment(84532) // returns 'basesepolia'
 * getEnvironment('arbitrumSepolia') // returns 'arbitrumsepolia'
 */
export function getEnvironment(input: string | number): string {
  if (typeof input === "string" && !input.match(/^\d+$/)) {
    // If input is a string and not a number, treat it as a subdomain
    switch (input.toLowerCase()) {
      case "arbitrumsepolia":
        return "arbitrumsepolia";
      case "basesepolia":
        return "basesepolia";
      case "localhost":
        return "localhost";
      default:
        console.warn(`Unknown subdomain: ${input}, falling back to default`);
        return "arbitrumsepolia"; // Default fallback
    }
  }

  // Treat input as a chain ID
  const id = typeof input === "string" ? Number.parseInt(input, 10) : input;
  switch (id) {
    case 421614:
      return "arbitrumsepolia";
    case 84532:
      return "basesepolia";
    case 1337:
      return "localhost";
    default:
      console.warn(`Unknown chain ID: ${id}, falling back to default`);
      return "arbitrumsepolia"; // Default fallback
  }
}

/**
 * Mapping of environment names to their corresponding chain IDs.
 * This can be useful for reverse lookups or validation.
 */
export const ENVIRONMENT_CHAIN_IDS = {
  arbitrumsepolia: 421614,
  basesepolia: 84532,
  localhost: 1337,
} as const;

/**
 * Type representing the valid environment names.
 * This can be used for type checking throughout the application.
 */
export type Environment = keyof typeof ENVIRONMENT_CHAIN_IDS;

/**
 * Validates if a given string is a valid environment name.
 *
 * @param env - The string to validate
 * @returns True if the string is a valid environment name, false otherwise
 */
export function isValidEnvironment(env: string): env is Environment {
  return env in ENVIRONMENT_CHAIN_IDS;
}
