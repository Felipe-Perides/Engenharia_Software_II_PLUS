import { app } from "./app";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`plus-ms-auth rodando na porta ${PORT}`);
  console.log(`Documentação: http://localhost:${PORT}/docs`);
});