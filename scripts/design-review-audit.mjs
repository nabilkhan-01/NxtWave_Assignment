import http from 'http';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

function startStaticServer(port = 4173) {
  const server = http.createServer((req, res) => {
    const safeUrl = req.url.split('?')[0];
    const targetFile = safeUrl === '/' ? 'index.html' : safeUrl.slice(1);
    const filePath = path.join('D:\\NXTWave\\dist', targetFile);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream('D:\\NXTWave\\dist\\index.html').pipe(res);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

async function waitForServer(url, timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} not responding`);
}

async function runAudit() {
  const server = await startStaticServer(4173);
  console.log('Static server listening on http://127.0.0.1:4173');

  try {
    const profileDir = 'C:\\Users\\Nabil\\.gemini\\antigravity\\brain\\b8cb49a0-d8c4-4978-846f-b2b0473be895\\scratch\\chrome-audit';
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${profileDir}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check'
    ]);

    try {
      await waitForServer('http://127.0.0.1:9222/json/list');
      const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://127.0.0.1:4173', { method: 'PUT' });
      const tab = await newTabRes.json();

      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      let id = 1;
      const pending = new Map();

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && pending.has(data.id)) {
          pending.get(data.id)(data.result);
          pending.delete(data.id);
        }
      };

      await new Promise(r => ws.onopen = r);

      const send = (method, params = {}) => new Promise((resolve) => {
        const reqId = id++;
        pending.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });

      await send('Page.enable');
      await send('Runtime.enable');

      const evalExpr = async (expression) => {
        const res = await send('Runtime.evaluate', {
          expression,
          returnByValue: true
        });
        return res?.result?.value;
      };

      // 1. Desktop 1440px Landing
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise(r => setTimeout(r, 1000));
      const shotLanding = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-desktop-landing.png', Buffer.from(shotLanding.data, 'base64'));

      // 2. Assess default preset
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise(r => setTimeout(r, 600));

      // Scroll to results and capture
      await evalExpr('document.querySelector(".results-worksheet")?.scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));
      const shotResults = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-desktop-results.png', Buffer.from(shotResults.data, 'base64'));

      // Scroll to workshop CTA
      await evalExpr('document.querySelector(".section-workshop")?.scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));
      const shotWorkshop = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-desktop-workshop.png', Buffer.from(shotWorkshop.data, 'base64'));

      // Open simulator and scroll
      await evalExpr('document.querySelector(".simulator-accordion-trigger").click()');
      await new Promise(r => setTimeout(r, 400));
      await evalExpr('document.querySelector(".section-simulator")?.scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));
      const shotSimulator = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-desktop-simulator.png', Buffer.from(shotSimulator.data, 'base64'));

      // 3. Tablet 768px View
      await send('Emulation.setDeviceMetricsOverride', {
        width: 768,
        height: 1024,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise(r => setTimeout(r, 500));
      await evalExpr('window.scrollTo(0, 0)');
      await new Promise(r => setTimeout(r, 300));
      const shotTablet = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-tablet.png', Buffer.from(shotTablet.data, 'base64'));

      // 4. Mobile 375px View - Top
      await send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 812,
        deviceScaleFactor: 2,
        mobile: true
      });
      await evalExpr('window.scrollTo(0, 0)');
      await new Promise(r => setTimeout(r, 500));
      const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-mobile.png', Buffer.from(shotMobile.data, 'base64'));

      // 5. Mobile 375px - Results
      await evalExpr('document.querySelector(".results-worksheet")?.scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));
      const shotMobileResults = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-mobile-results.png', Buffer.from(shotMobileResults.data, 'base64'));

      // 6. Mobile 375px - Workshop
      await evalExpr('document.querySelector(".section-workshop")?.scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));
      const shotMobileWorkshop = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-mobile-workshop.png', Buffer.from(shotMobileWorkshop.data, 'base64'));

      // 7. Mobile 375px - Simulator
      await evalExpr('document.querySelector(".section-simulator")?.scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));
      const shotMobileSimulator = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\audit-mobile-simulator.png', Buffer.from(shotMobileSimulator.data, 'base64'));

      // 8. Check for horizontal overflow across viewports
      const overflowCheck = await evalExpr(`(() => {
        return {
          windowInnerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`);
      console.log('Mobile overflow check:', overflowCheck);

      ws.close();
    } finally {
      chrome.kill();
    }
  } finally {
    server.close();
  }

  console.log('Audit screenshots generated successfully.');
}

runAudit().catch(console.error);
