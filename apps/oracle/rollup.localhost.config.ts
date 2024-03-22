import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import builtins from "builtin-modules";

export default {
  input: "src/localhost/index.ts",
  output: {
    file: "dist/localhost/index.js",
    format: "cjs",
    //inlineDynamicImports: true, // Inline dynamic imports
  },
  plugins: [resolve({ preferBuiltins: true }), commonjs(), json({ compact: true }), typescript()],
  external: [...builtins, "ethers", "axios", /^@openzeppelin\/defender-relay-client(\/.*)?$/],
};
