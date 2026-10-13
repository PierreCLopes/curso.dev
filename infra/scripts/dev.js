const { spawn, spawnSync } = require("node:child_process");

const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(
  process.execPath,
  [nextBin, "dev", ...process.argv.slice(2)],
  {
    stdio: "inherit",
  },
);

// O Ctrl+C já chega no processo do Next, porque ele está no mesmo terminal.
// Aqui só impedimos que o wrapper morra antes de rodar a limpeza.
process.on("SIGINT", () => {});
// SIGTERM e SIGHUP não chegam automaticamente ao filho, então repassamos.
for (const sig of ["SIGTERM", "SIGHUP"]) {
  process.on(sig, () => child.kill(sig));
}

let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  console.log("\n> Parando serviços...");
  const result = spawnSync("npm", ["run", "services:stop"], {
    stdio: "inherit",
    shell: true, // necessário no Windows, onde o npm é um .cmd
  });
  if (result.status !== 0) {
    console.error(
      "🔴 Falha ao parar os serviços (exit code",
      result.status,
      ")",
    );
  }
}

child.on("exit", async (code, signal) => {
  try {
    await cleanup();
  } finally {
    process.exit(code ?? (signal ? 0 : 1));
  }
});
