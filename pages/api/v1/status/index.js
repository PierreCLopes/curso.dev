import database from "infra/database.js";

async function status(request, response) {
  const result = await database.query("SELECT 1 + 1 SUM;");

  console.log(result.rows);

  response.status(200).json({ mensagem: "Sucesso" });
}

export default status;
