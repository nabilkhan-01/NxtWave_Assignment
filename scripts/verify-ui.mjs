import { spawn } from 'child_process';
import fs from 'fs';

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
  throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
}

async function run() {
  console.log('1. Starting preview server...');
  const preview = spawn('cmd.exe', ['/c', 'npx', 'vite', 'preview', '--port', '4173', '--strictPort'], {
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:4173');
    console.log('2. Preview server is responding on http://localhost:4173');

    console.log('3. Launching Chrome with remote debugging...');
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--remote-debugging-port=9222',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check'
    ]);

    try {
      await waitForServer('http://localhost:9222/json/list');

      const testUrl = 'http://localhost:4173/?utm_source=campus-club&utm_campaign=capstone-drive';
      const newTabRes = await fetch(`http://localhost:9222/json/new?${encodeURIComponent(testUrl)}`, { method: 'PUT' });
      const tab = await newTabRes.json();
      const wsUrl = tab.webSocketDebuggerUrl;

      const ws = new WebSocket(wsUrl);
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
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      const evalExpr = async (expression) => {
        const res = await send('Runtime.evaluate', {
          expression,
          returnByValue: true
        });
        return res?.result?.value;
      };

      await new Promise(r => setTimeout(r, 1200));

      console.log('\n--- Test 1: Simulator Collapsed by Default ---');
      const isInitiallyOpen = await evalExpr('Boolean(document.querySelector("#growth-model-content"))');
      console.log('Is simulator open initially:', isInitiallyOpen);

      console.log('\n--- Test 2: Expand Simulator ---');
      await evalExpr('document.querySelector(".simulator-accordion-trigger").click()');
      await new Promise(r => setTimeout(r, 400));
      const isOpenAfterClick = await evalExpr('Boolean(document.querySelector("#growth-model-content"))');
      console.log('Is simulator open after toggle:', isOpenAfterClick);

      console.log('\n--- Test 3: Base Scenario Calculations ---');
      const baseTotal = await evalExpr('document.querySelector(".total-step .step-val")?.innerText');
      const baseGap = await evalExpr('document.querySelector(".target-status")?.innerText');
      const baseCPR = await evalExpr('document.querySelector(".cpr-val")?.innerText');
      const baseBottleneck = await evalExpr('document.querySelector(".guidance-title")?.innerText');
      console.log('Base total registrations:', baseTotal);
      console.log('Base target status:', baseGap);
      console.log('Base CPR:', baseCPR);
      console.log('Base scenario bottleneck:', baseBottleneck);

      console.log('\n--- Test 4: Select Conservative Scenario ---');
      await evalExpr('document.querySelectorAll(".scenario-btn")[0].click()');
      await new Promise(r => setTimeout(r, 300));
      const consTotal = await evalExpr('document.querySelector(".total-step .step-val")?.innerText');
      const consBottleneck = await evalExpr('document.querySelector(".guidance-title")?.innerText');
      console.log('Conservative total registrations:', consTotal);
      console.log('Conservative bottleneck:', consBottleneck);

      console.log('\n--- Test 5: Select Stretch Scenario ---');
      await evalExpr('document.querySelectorAll(".scenario-btn")[2].click()');
      await new Promise(r => setTimeout(r, 300));
      const stretchTotal = await evalExpr('document.querySelector(".total-step .step-val")?.innerText');
      const stretchStatus = await evalExpr('document.querySelector(".target-status")?.innerText');
      const stretchGuidance = await evalExpr('document.querySelector(".guidance-title")?.innerText');
      console.log('Stretch total registrations:', stretchTotal);
      console.log('Stretch status:', stretchStatus);
      console.log('Stretch guidance:', stretchGuidance);

      console.log('\n--- Test 6: Manual Input Reactive Update ---');
      await evalExpr(`(() => {
        const input = document.querySelector("#input-connectors");
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(input, "10");
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      })()`);
      await new Promise(r => setTimeout(r, 300));
      const manualTotal = await evalExpr('document.querySelector(".total-step .step-val")?.innerText');
      const customPill = await evalExpr('document.querySelector(".scenario-custom-pill")?.innerText');
      console.log('Total registrations after manual input change (10 connectors):', manualTotal);
      console.log('Active scenario badge after edit:', customPill);

      // Scroll to simulator and capture screenshot
      await evalExpr('document.querySelector(".section-simulator").scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));
      const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\desktop-simulator.png', Buffer.from(shotDesktop.data, 'base64'));
      console.log('Saved desktop-simulator.png');

      console.log('\n--- Test 7: Mobile Viewport 375x667 Check ---');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 500));

      const overflowCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const docWidth = document.documentElement.offsetWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          return { docWidth, scrollWidth, hasOverflow: scrollWidth > docWidth };
        })()`,
        returnByValue: true
      });
      console.log('Mobile width overflow check (375px):', overflowCheck?.result?.value);

      const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\mobile-simulator.png', Buffer.from(shotMobile.data, 'base64'));
      console.log('Saved mobile-simulator.png');

      ws.close();
    } finally {
      chrome.kill();
    }
  } finally {
    preview.kill();
  }
  console.log('\nAll Milestone 5 verification scenarios executed successfully!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
