import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "@rollup/plugin-typescript";
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import path from "path";

const getEnv = () => Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.startsWith('CC_'))
);

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: path.join("build", "index.mjs"),
        format: "esm",
      },
      {
        file: path.join("build", "index.cjs"),
        format: "commonjs",
      },
    ],
    plugins: [
      peerDepsExternal({
        includeDependencies: true,
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        noEmit: true,
      }),
      injectProcessEnv(getEnv()),
    ],
  },
];
