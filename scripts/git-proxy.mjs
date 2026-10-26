import http from 'node:http';
import net from 'node:net';
import dns from 'node:dns';

const BOGUS_DNS_IPS = new Set([
  '198.41.0.4', '199.9.14.201', '192.33.4.12', '199.7.91.13',
  '192.203.230.10', '192.5.5.241', '192.112.36.4', '198.97.190.53',
  '192.36.148.17', '192.58.128.30', '193.0.14.129', '199.7.83.42',
  '202.12.27.33',
]);

const KNOWN_HOSTS = {
  'github.com': '140.82.121.3',
  'api.github.com': '140.82.121.6',
};

function resolveHost(hostname, callback) {
  if (KNOWN_HOSTS[hostname]) {
    return callback(null, KNOWN_HOSTS[hostname]);
  }
  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err);
    const valid = addresses.find((a) => !BOGUS_DNS_IPS.has(a.address));
    if (valid) {
      return callback(null, valid.address);
    }
    callback(new Error(`No valid address found for ${hostname}`));
  });
}

const server = http.createServer((_req, res) => {
  res.writeHead(405);
  res.end('Use CONNECT proxy for HTTPS');
});

server.on('connect', (req, clientSocket, head) => {
  const [hostname, portStr] = (req.url || '').split(':');
  const port = parseInt(portStr, 10) || 443;

  resolveHost(hostname, (err, targetIp) => {
    if (err) {
      clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
      clientSocket.end();
      return;
    }

    const serverSocket = net.connect(port, targetIp, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head && head.length > 0) {
        serverSocket.write(head);
      }
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on('error', () => {
      clientSocket.end();
    });

    clientSocket.on('error', () => {
      serverSocket.end();
    });
  });
});

const PORT = 19191;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Git proxy listening on http://127.0.0.1:${PORT}`);
});
