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

      // Test with incoming UTM attribution query parameters
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
      try {
        await send('Browser.grantPermissions', {
          permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite']
        });
      } catch {
        // Ignored if browser permissions not supported on platform
      }
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      await new Promise(r => setTimeout(r, 1500));

      const evalExpr = async (expression) => {
        const res = await send('Runtime.evaluate', {
          expression,
          returnByValue: true
        });
        return res?.result?.value;
      };

      const title = await evalExpr('document.title');
      console.log('Page Title:', title);

      // Scenario 1: Initial Course Notes Q&A assessment
      console.log('\n--- Scenario 1: Course Notes Q&A Assessment ---');
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise(r => setTimeout(r, 500));

      const verdict1 = await evalExpr('document.querySelector(".verdict-headline")?.innerText');
      const fit1 = await evalExpr('document.querySelector(".metric-fit-label")?.innerText');
      console.log('Verdict:', verdict1);
      console.log('Fit Label:', fit1);

      // Scenario 2: Workshop CTA checks
      console.log('\n--- Scenario 2: Workshop CTA Checks ---');
      const workshopTitle = await evalExpr('document.querySelector("#workshop-heading")?.innerText');
      console.log('Workshop Title:', workshopTitle);

      const simBtn = await evalExpr('document.querySelector(".btn-workshop")?.innerText');
      console.log('Simulate Button Text:', simBtn);

      // Click "Simulate registration"
      console.log('Clicking "Simulate registration"...');
      await evalExpr('document.querySelector(".btn-workshop").click()');
      await new Promise(r => setTimeout(r, 400));

      const confirmedTitle = await evalExpr('document.querySelector(".confirmed-title")?.innerText');
      const confirmedText = await evalExpr('document.querySelector(".confirmed-text")?.innerText');
      console.log('Registration Status:', confirmedTitle);
      console.log('Confirmation Note:', confirmedText);

      await evalExpr('document.querySelector(".section-workshop").scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));

      const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\desktop-worksheet-cta.png', Buffer.from(shotDesktop.data, 'base64'));

      // Scenario 3: Sharing actions & attribution propagation
      console.log('\n--- Scenario 3: Teammate Sharing & Attribution ---');
      const waLink = await evalExpr('document.querySelector(".share-btn-whatsapp")?.getAttribute("href")');
      console.log('WhatsApp Link:', waLink);

      // Verify incoming utm_campaign was preserved in the share link
      const hasPreservedCampaign = waLink?.includes('utm_campaign%3Dcapstone-drive') || waLink?.includes('capstone-drive');
      const hasPeerSource = waLink?.includes('utm_source%3Dpeer') || waLink?.includes('peer');
      console.log('Share link preserves incoming campaign:', Boolean(hasPreservedCampaign));
      console.log('Share link includes peer attribution:', Boolean(hasPeerSource));

      // Test Copy link button click
      console.log('Testing "Copy link" button interaction...');
      await evalExpr('document.querySelector(".share-btn-copy").click()');
      await new Promise(r => setTimeout(r, 300));

      const copyBtnText = await evalExpr('document.querySelector(".share-btn-copy")?.innerText');
      console.log('Copy button text after click:', copyBtnText);

      // Scenario 4: Custom Manageable Idea
      console.log('\n--- Scenario 4: Custom Manageable Idea ---');
      await evalExpr(`(() => {
        document.querySelector(".custom-toggle-btn").click();
        const ta = document.querySelector("#project-description");
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        nativeInputValueSetter.call(ta, "Build a page where I paste one job description and one resume, then show the matching skills and missing skills.");
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      })()`);
      await new Promise(r => setTimeout(r, 300));
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise(r => setTimeout(r, 500));

      const verdictManageable = await evalExpr('document.querySelector(".verdict-headline")?.innerText');
      console.log('Custom Idea Verdict:', verdictManageable);

      // Scenario 5: Vague Career Goal
      console.log('\n--- Scenario 5: Vague Career Goal ---');
      await evalExpr(`(() => {
        const ta = document.querySelector("#project-description");
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        nativeInputValueSetter.call(ta, "project to show foreign internship and full time role for especially freshers");
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      })()`);
      await new Promise(r => setTimeout(r, 300));
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise(r => setTimeout(r, 500));

      const verdictVague = await evalExpr('document.querySelector(".verdict-headline")?.innerText');
      console.log('Vague Goal Verdict:', verdictVague);

      // Scenario 6: Mobile Viewport Check (375x667)
      console.log('\n--- Scenario 6: Mobile Viewport Check (375x667) ---');
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
      console.log('Mobile width overflow check:', overflowCheck.result.value);

      await evalExpr('document.querySelector(".section-workshop").scrollIntoView()');
      await new Promise(r => setTimeout(r, 400));

      const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\mobile-worksheet-cta.png', Buffer.from(mobileShot.data, 'base64'));

      ws.close();
    } finally {
      chrome.kill();
    }
  } finally {
    preview.kill();
  }
  console.log('\nAll Milestone 4 verification scenarios completed successfully!');
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
