import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import builtins from "builtin-modules";

export default {
  input: "src/defender/actions/release-next-auction/index.ts",
  output: {
    file: "dist/defender/actions/release-next-auction/index.js",
    format: "cjs",
    //inlineDynamicImports: true, // Inline dynamic imports
  },
  plugins: [resolve({ preferBuiltins: true }), commonjs(), json({ compact: true }), typescript()],
  external: [...builtins, "ethers", "axios", /^@openzeppelin\/defender-relay-client(\/.*)?$/],
};
