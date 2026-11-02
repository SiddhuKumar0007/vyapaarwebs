import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, appendFileSync, readFileSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const leadsFile = resolve('leads.json');
const leadsCsv = resolve('leads.csv');

// Initialize CSV header if not exists
if (!existsSync(leadsCsv)) {
  try {
    appendFileSync(leadsCsv, 'Timestamp,Name,Phone,Email,Source\n', 'utf-8');
  } catch (e) {}
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname;

  // API: Save Lead
  if (req.method === 'POST' && pathname === '/api/lead') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const lead = JSON.parse(body);
        lead.id = 'lead_' + Date.now();
        lead.createdAt = new Date().toISOString();

        // 1. Save to leads.json
        let leads = [];
        try {
          if (existsSync(leadsFile)) {
            leads = JSON.parse(await readFile(leadsFile, 'utf-8'));
          }
        } catch (e) {
          leads = [];
        }
        leads.unshift(lead);
        await writeFile(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');

        // 2. Append to leads.csv (Excel format)
        const csvLine = `"${lead.createdAt}","${(lead.name || '').replace(/"/g, '""')}","${(lead.phone || '').replace(/"/g, '""')}","${(lead.email || '').replace(/"/g, '""')}","${(lead.source || 'Website Popup').replace(/"/g, '""')}"\n`;
        appendFileSync(leadsCsv, csvLine, 'utf-8');

        console.log(`\n========================================`);
        console.log(`🔥 [NEW LEAD RECEIVED AT ${new Date().toLocaleTimeString()}]:`);
        console.log(`👤 Name:  ${lead.name}`);
        console.log(`📞 Phone: ${lead.phone}`);
        console.log(`✉️ Email: ${lead.email}`);
        console.log(`========================================\n`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Lead saved successfully', leadId: lead.id }));
      } catch (err) {
        console.error('Error saving lead:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // API: Get all leads (For admin inspection)
  if (req.method === 'GET' && pathname === '/api/leads') {
    try {
      let leads = [];
      if (existsSync(leadsFile)) {
        leads = JSON.parse(await readFile(leadsFile, 'utf-8'));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, count: leads.length, leads }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Could not read leads' }));
    }
  }

  // API: Export CSV
  if (req.method === 'GET' && pathname === '/api/leads/export') {
    try {
      const csvData = existsSync(leadsCsv) ? await readFile(leadsCsv) : 'Timestamp,Name,Phone,Email,Source\n';
      res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="vyapaarwebs_leads.csv"'
      });
      return res.end(csvData);
    } catch (e) {
      res.writeHead(500);
      return res.end('Export failed');
    }
  }

  // Static file serving
  try {
    let path = resolve(root, '.' + decodeURIComponent(pathname));
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      return res.end();
    }
    if (!extname(path)) path = resolve(path, 'index.html');
    const data = await readFile(path);
    res.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4173, '127.0.0.1', () => {
  console.log('VyapaarWebs running at: http://127.0.0.1:4173');
});
