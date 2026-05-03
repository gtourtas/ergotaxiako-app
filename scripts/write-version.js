import fs from "fs";
import pkg from "../package.json" with { type: "json" };
const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "local";
const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || "local";
fs.writeFileSync(new URL("../src/version.json", import.meta.url), JSON.stringify({
  version: `v${pkg.version.split(".")[0]}`,
  packageVersion: pkg.version,
  commit: commit.slice(0,7),
  branch,
  builtAt: new Date().toISOString()
}, null, 2));
