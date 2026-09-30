#!/usr/bin/env node
/**
 * Figma CLI helper for Data Sorcerers
 * Usage:
 *   node scripts/figma.mjs node <nodeId> [--depth <N>]
 *   node scripts/figma.mjs tree <nodeId> [depth]
 *   node scripts/figma.mjs export <nodeId> [--scale 1] [--format png|svg] [--out path]
 *   node scripts/figma.mjs search <name>
 */

import fs from 'node:fs';
import https from 'node:https';

const DEFAULT_FILE_KEY = 'JYUzJK1hFqaEwL6DpdDvjp';

function getFigmaToken() {
  if (process.env.FIGMA_API_KEY) return process.env.FIGMA_API_KEY;
  try {
    const config = JSON.parse(
      fs.readFileSync(
        `${process.env.HOME}/.gemini/config/mcp_config.json`,
        'utf8',
      ),
    );
    if (config?.mcpServers?.figma?.env?.FIGMA_API_KEY) {
      return config.mcpServers.figma.env.FIGMA_API_KEY;
    }
  } catch {}
  throw new Error(
    'FIGMA_API_KEY not set (env var or ~/.gemini/config/mcp_config.json).',
  );
}

function figmaRequest(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      `https://api.figma.com/v1${path}`,
      {
        headers: { 'X-Figma-Token': getFigmaToken() },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 400) {
              reject(
                new Error(
                  parsed.err || parsed.message || `HTTP ${res.statusCode}`,
                ),
              );
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(
              new Error(`Failed to parse response: ${body.slice(0, 100)}`),
            );
          }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

async function inspectNode(nodeId, depth = 2, fileKey = DEFAULT_FILE_KEY) {
  const data = await figmaRequest(
    `/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=${depth}`,
  );
  const node = data.nodes[nodeId]?.document;
  if (!node) {
    console.error(`Node ${nodeId} not found.`);
    return;
  }

  function summarize(n, indent = 0) {
    const pad = '  '.repeat(indent);
    const bbox = n.absoluteBoundingBox
      ? `(${Math.round(n.absoluteBoundingBox.x)}, ${Math.round(n.absoluteBoundingBox.y)}) ${n.absoluteBoundingBox.width}x${n.absoluteBoundingBox.height}`
      : '';
    const layout = n.layoutMode
      ? `[${n.layoutMode} gap:${n.itemSpacing || 0} p:${n.paddingTop || 0}/${n.paddingRight || 0}/${n.paddingBottom || 0}/${n.paddingLeft || 0}]`
      : '';
    console.log(`${pad}- [${n.id}] ${n.name} (${n.type}) ${bbox} ${layout}`);

    if (n.style) {
      console.log(
        `${pad}  font: ${n.style.fontFamily} ${n.style.fontWeight} ${n.style.fontSize}px/${n.style.lineHeightPx || n.style.lineHeightPercentFontSize || ''} ls:${n.style.letterSpacing || 0}`,
      );
    }
    if (n.fills && n.fills.length > 0) {
      const fills = n.fills
        .map((f) => {
          if (f.type === 'SOLID' && f.color) {
            const r = Math.round(f.color.r * 255);
            const g = Math.round(f.color.g * 255);
            const b = Math.round(f.color.b * 255);
            return `rgba(${r},${g},${b},${f.opacity ?? 1})`;
          }
          return f.type;
        })
        .join(', ');
      console.log(`${pad}  fills: ${fills}`);
    }
    if (n.children && indent < depth) {
      for (const child of n.children) {
        summarize(child, indent + 1);
      }
    }
  }

  console.log(`=== Node ${nodeId} in ${fileKey} ===`);
  summarize(node);
}

async function exportNode(
  nodeId,
  scale = 1,
  format = 'png',
  outFile,
  fileKey = DEFAULT_FILE_KEY,
) {
  const data = await figmaRequest(
    `/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&scale=${scale}&format=${format}`,
  );
  const url = data.images?.[nodeId];
  if (!url) {
    console.error(`Failed to generate export URL for node ${nodeId}`);
    return;
  }
  console.log(`Export URL: ${url}`);
  if (outFile) {
    await downloadFile(url, outFile);
    console.log(`Saved to ${outFile}`);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Failed to download: HTTP ${res.statusCode}`),
          );
        }
        const stream = fs.createWriteStream(dest);
        res.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          resolve();
        });
        stream.on('error', reject);
      })
      .on('error', reject);
  });
}

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd || cmd === '--help' || cmd === '-h') {
  console.log(`
Figma CLI Helper for Data Sorcerers
Usage:
  node scripts/figma.mjs node <nodeId> [depth]
  node scripts/figma.mjs export <nodeId> [scale] [format] [outPath]
`);
  process.exit(0);
}

try {
  if (cmd === 'node') {
    const nodeId = args[1];
    const depth = parseInt(args[2] || '2', 10);
    await inspectNode(nodeId, depth);
  } else if (cmd === 'export') {
    const nodeId = args[1];
    const scale = parseFloat(args[2] || '1');
    const format = args[3] || 'png';
    const outPath = args[4];
    await exportNode(nodeId, scale, format, outPath);
  } else {
    console.error(`Unknown command: ${cmd}`);
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
