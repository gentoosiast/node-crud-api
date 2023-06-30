import http from 'node:http';

export const getRequestBody = async (req: http.IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
    const body: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      body.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(body).toString());
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
};
