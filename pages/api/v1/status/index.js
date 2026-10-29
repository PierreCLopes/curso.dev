import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    let query = await database.query("SHOW server_version;");
    const databaseVersion = query.rows[0].server_version;

    query = await database.query("SHOW max_connections;");
    const databaseMaxConnections = query.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    query = await database.query({
      text: "SELECT COUNT(*)::INT FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const openedConnections = query.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion,
          max_connections: parseInt(databaseMaxConnections),
          opened_connections: parseInt(openedConnections),
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log("\n Erro dentro do catch do controler: ");
    console.error(publicErrorObject);

    response.status(500).json(publicErrorObject);
  }
}

export default status;
