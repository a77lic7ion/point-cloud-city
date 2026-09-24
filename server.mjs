/*
 * Token City — static server + collect API
 * Serves the procedural city files directly, no build step.
 * GET /api/collect -> run collect-usage.py -> return usage.json
 */
import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const PORT = Number(process.env.PORT) || 8221;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.py': 'text/x-python; charset=utf-8',
};

function apiJson(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(payload));
}

function runCollect() {
  return new Promise((resolve, reject) => {
    const p = spawn('/usr/bin/python3', ['collect-usage.py'], { cwd: ROOT, timeout: 60000 });
    let stdout = '';
    let stderr = '';
    p.stdout.on('data', (d) => { stdout += d.toString(); });
    p.stderr.on('data', (d) => { stderr += d.toString(); });
    p.on('close', (code) => {
      resolve({ code, stdout: stdout.slice(-3000), stderr: stderr.slice(-3000) });
    });
    p.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/collect' && (req.method === 'GET' || req.method === 'POST')) {
    try {
      const result = await runCollect();
      let usage = null;
      try { usage = JSON.parse(await readFile(join(ROOT, 'usage.json'), 'utf8')); } catch { /* ignore */ }
      apiJson(res, 200, {
        ok: result.code === 0,
        exitCode: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
        usage,
      });
    } catch (e) {
      apiJson(res, 500, { ok: false, error: e.message });
    }
    return;
  }

  try {
    let path = decodeURIComponent(url.pathname);
    if (path === '/') path = '/procedural-city-demo.html';
    const fullPath = normalize(join(ROOT, path));
    if (!fullPath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const data = await readFile(fullPath);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(fullPath)] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(data);
  } catch {
    res.writeHead(404).end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Token City point-cloud + API on :${PORT}`);
});
