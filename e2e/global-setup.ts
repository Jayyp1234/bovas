import { execFileSync } from "node:child_process";
import path from "node:path";

/** Resets bovas-api's demo depot so every run starts from the same tickets and trucks. */
export default function globalSetup() {
  if (process.env.E2E_SKIP_RESET) {
    return;
  }

  const apiDir = path.resolve(process.env.BOVAS_API_DIR ?? "../bovas-api");
  execFileSync("php", ["bin/reset-demo.php"], { cwd: apiDir, stdio: "inherit" });
}
