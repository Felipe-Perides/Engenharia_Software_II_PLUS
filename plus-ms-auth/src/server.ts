import { app } from "./app";

const PORT = Number(process.env.PORT) || 3001;
// Bind IPv4 explicitly: in Docker on Windows, default listen can be IPv6-only (::) while
// the browser hits 127.0.0.1 via port mapping, which surfaces as ERR_EMPTY_RESPONSE.
const HOST = process.env.LISTEN_HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`plus-ms-auth a escutar em http://${HOST}:${PORT}`);
  console.log(`Documentação: http://localhost:${PORT}/docs`);
});