function status(request, response) {
  response.status(200).json({ mensagem: "Sucesso" });
}

export default status;
