const { existsSync, rmSync } = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const nextDir = path.resolve(projectRoot, ".next");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

if (!nextDir.startsWith(`${projectRoot}${path.sep}`)) {
  throw new Error("Refusing to clean a path outside the client project.");
}

if (existsSync(nextDir)) {
  try {
    rmSync(nextDir, { recursive: true, force: true });
    console.log("Cleaned stale .next cache.");
  } catch (error) {
    console.warn("Could not clean .next cache. Stop the running client terminal and run npm run dev again.");
    console.warn(error.message);
  }
}

if (process.argv.includes("--clean-only")) {
  process.exit(0);
}

const child = spawn(process.execPath, [nextBin, "dev"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit"
});

child.on("exit", (code) => process.exit(code ?? 0));
