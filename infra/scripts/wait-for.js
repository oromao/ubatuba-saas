const net = require('net');

const args = process.argv.slice(2);
const separatorIndex = args.indexOf('--');
const targets = separatorIndex === -1 ? args : args.slice(0, separatorIndex);
const command = separatorIndex === -1 ? [] : args.slice(separatorIndex + 1);

function waitForTarget(target) {
  const [host, portStr] = target.split(':');
  const port = Number(portStr);

  return new Promise((resolve) => {
    const tryConnect = () => {
      const socket = net.createConnection(port, host);
      socket.on('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        setTimeout(tryConnect, 1000);
      });
    };
    tryConnect();
  });
}

(async () => {
  for (const target of targets) {
    if (target.startsWith('redis') && !process.env.REDIS_URL) {
      continue;
    }
    await waitForTarget(target);
  }

  if (command.length > 0) {
    const { spawn } = require('child_process');
    const proc = spawn(command[0], command.slice(1), { stdio: 'inherit' });
    proc.on('exit', (code) => process.exit(code ?? 0));
  }
})();
