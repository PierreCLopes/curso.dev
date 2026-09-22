const { exec } = require("node:child_process");
const { setTimeout: sleep } = require("node:timers/promises");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  async function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");

      await sleep(1000);

      checkPostgres();

      return;
    }

    console.log("\n\n🟢 Postgres está pronto e aceitando conexões!");
  }
}

process.stdout.write("\n\n🔴 Aguardando Postgres aceitar conexões");

checkPostgres();
