import net from 'net';

const targetHost = process.argv[2] || '193.122.127.129';
const targetPort = parseInt(process.argv[3] || '22', 10);

const sock = net.createConnection({ host: '192.168.46.1', port: 7891 }, () => {
  sock.write(Buffer.from([0x05, 0x01, 0x02]));
});

let state = 0; // 0: greeting, 1: auth, 2: connect, 3: tunnel

sock.on('data', (data) => {
  if (state === 0 && data[0] === 0x05 && data[1] === 0x02) {
    state = 1;
    const uBuf = Buffer.from('Clash');
    const pBuf = Buffer.from('yifoJINF');
    const req = Buffer.concat([
      Buffer.from([0x01, uBuf.length]),
      uBuf,
      Buffer.from([pBuf.length]),
      pBuf
    ]);
    sock.write(req);
  } else if (state === 1 && data[0] === 0x01 && data[1] === 0x00) {
    state = 2;
    const ipParts = targetHost.split('.').map(Number);
    const req = Buffer.from([0x05, 0x01, 0x00, 0x01, ...ipParts, (targetPort >> 8) & 0xff, targetPort & 0xff]);
    sock.write(req);
  } else if (state === 2 && data[0] === 0x05 && data[1] === 0x00) {
    state = 3;

    if (data.length > 10) {
      process.stdout.write(data.slice(10));
    }

    process.stdin.resume();
    process.stdin.on('data', (chunk) => {
      sock.write(chunk);
    });

    process.stdin.on('end', () => {
      sock.end();
    });
  } else if (state === 3) {
    process.stdout.write(data);
  }
});

sock.on('close', () => {
  process.exit(0);
});

sock.on('error', () => {
  process.exit(1);
});
