const mc = require('minecraft-protocol');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

(async () => {
  const BACKEND_HOST = await ask('Adresse IP serveur backend (ex: 127.0.0.1) : ');
  const BACKEND_PORT = parseInt(await ask('Port serveur backend (ex: 25565) : '), 10);

  const LISTEN_PORT = parseInt(await ask('Port local du proxy (ex: 25570) : '), 10);

  const SPOOFED_USERNAME = await ask('Pseudo à spoof : ');
  const SPOOFED_IP = await ask('IP à spoof : ');

  rl.close();

  const proxy = mc.createServer({
    'online-mode': false,
    port: LISTEN_PORT,
    version: false
  });

  proxy.on('login', (client) => {
    console.log(`[+] Connexion interceptée depuis ${client.socket.remoteAddress}`);

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

  console.log(`🚀 Proxy actif sur localhost:${LISTEN_PORT}`);
  console.log(`🎮 Connecte-toi à localhost:${LISTEN_PORT} dans Minecraft`);
})();
