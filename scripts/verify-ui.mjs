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

      // Create new tab navigating to preview
      const newTabRes = await fetch('http://localhost:9222/json/new?http://localhost:4173', { method: 'PUT' });
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

      await new Promise(r => setTimeout(r, 1500));

      const titleRes = await send('Runtime.evaluate', { expression: 'document.title' });
      console.log('Page Title:', titleRes.result.value);

      // Scenario 1: Initial Course Notes Q&A assessment
      console.log('\n--- Scenario 1: Course Notes Q&A Assessment ---');
      await send('Runtime.evaluate', {
        expression: 'document.querySelector("button.btn-primary").click()'
      });
      await new Promise(r => setTimeout(r, 500));

      const verdict1 = await send('Runtime.evaluate', {
        expression: 'document.querySelector(".verdict-headline")?.innerText'
      });
      const score1 = await send('Runtime.evaluate', {
        expression: 'document.querySelector(".metric-score")?.innerText'
      });
      console.log('Verdict:', verdict1.result.value);
      console.log('Score:', score1.result.value);

      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\results-desktop-verdict.png', Buffer.from(shot1.data, 'base64'));
      console.log('Saved results-desktop-verdict.png');

      // Scenario 2: Select AI Lecture Companion preset and assess
      console.log('\n--- Scenario 2: AI Lecture Companion Assessment ---');
      await send('Runtime.evaluate', {
        expression: 'document.querySelectorAll(".preset-card")[3].click()'
      });
      await new Promise(r => setTimeout(r, 400));
      await send('Runtime.evaluate', {
        expression: 'document.querySelector("button.btn-primary").click()'
      });
      await new Promise(r => setTimeout(r, 500));

      const verdictLecture = await send('Runtime.evaluate', {
        expression: 'document.querySelector(".verdict-headline")?.innerText'
      });
      console.log('AI Lecture Companion Verdict:', verdictLecture.result.value);

      // Scenario 3: Custom Manageable Idea
      console.log('\n--- Scenario 3: Custom Manageable Idea ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          document.querySelector(".custom-toggle-btn").click();
          const ta = document.querySelector("#project-description");
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
          nativeInputValueSetter.call(ta, "Build a page where I paste one job description and one resume, then show the matching skills and missing skills.");
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
        })()`
      });
      await new Promise(r => setTimeout(r, 300));
      await send('Runtime.evaluate', {
        expression: 'document.querySelector("button.btn-primary").click()'
      });
      await new Promise(r => setTimeout(r, 500));

      const verdictManageable = await send('Runtime.evaluate', {
        expression: 'document.querySelector(".verdict-headline")?.innerText'
      });
      const scoreManageable = await send('Runtime.evaluate', {
        expression: 'document.querySelector(".metric-score")?.innerText'
      });
      console.log('Custom Idea Verdict:', verdictManageable.result.value);
      console.log('Custom Idea Score:', scoreManageable.result.value);

      const shotManageable = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\results-manageable.png', Buffer.from(shotManageable.data, 'base64'));
      console.log('Saved results-manageable.png');

      // Scenario 4: Validation Error on < 10 characters
      console.log('\n--- Scenario 4: Inline Validation Error ---');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const ta = document.querySelector("#project-description");
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
          nativeInputValueSetter.call(ta, "AI app");
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
        })()`
      });
      await new Promise(r => setTimeout(r, 300));

      const isBtnDisabled = await send('Runtime.evaluate', {
        expression: 'document.querySelector("button.btn-primary").disabled'
      });
      const inlineMsg = await send('Runtime.evaluate', {
        expression: 'document.querySelector(".inline-error")?.innerText'
      });
      console.log('Assess button disabled for "AI app":', isBtnDisabled.result.value);
      console.log('Inline validation message:', inlineMsg.result.value);

      // Scenario 5: Mobile Viewport (375x667)
      console.log('\n--- Scenario 5: Mobile Viewport Check (375x667) ---');
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

      const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('D:\\NXTWave\\mobile-full-check.png', Buffer.from(mobileShot.data, 'base64'));
      console.log('Saved mobile-full-check.png');

      ws.close();
    } finally {
      chrome.kill();
    }
  } finally {
    preview.kill();
  }
  console.log('\nAll browser verification scenarios completed successfully!');
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
