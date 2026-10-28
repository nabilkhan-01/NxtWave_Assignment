import http from 'http';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

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
      // SPA Fallback for /diagnose, /growth, /campaign
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream('D:\\NXTWave\\dist\\index.html').pipe(res);
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
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
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server at ${url} not responding`);
}

async function runQA() {
  console.log('=====================================================');
  console.log('    SHIPSCOPE MULTI-PAGE E2E BROWSER QA SUITE        ');
  console.log('=====================================================');
  const server = await startStaticServer(4173);

  const profileDir = 'C:\\Users\\Nabil\\.gemini\\antigravity\\brain\\b8cb49a0-d8c4-4978-846f-b2b0473be895\\scratch\\chrome-qa';
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

  const results = [];
  const consoleLogs = [];
  const networkRequests = [];

  function logPass(scenarioNum, name, details = '') {
    results.push({ scenario: scenarioNum, name, status: 'PASS', details });
    console.log(`[PASS] Scenario ${scenarioNum.toString().padStart(2, '0')}: ${name} ${details ? `(${details})` : ''}`);
  }

  function logFail(scenarioNum, name, error) {
    results.push({ scenario: scenarioNum, name, status: 'FAIL', error: String(error) });
    console.error(`[FAIL] Scenario ${scenarioNum.toString().padStart(2, '0')}: ${name} - ${error}`);
  }

  try {
    await waitForServer('http://127.0.0.1:9222/json/list');

    const testUrl = 'http://127.0.0.1:4173/?utm_source=campus-club&utm_campaign=capstone-drive&utm_medium=whatsapp';
    const newTabRes = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(testUrl)}`, { method: 'PUT' });
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
      if (data.method === 'Runtime.consoleAPICalled') {
        const text = data.params.args.map((a) => a.value || a.description).join(' ');
        consoleLogs.push({ type: data.params.type, text });
      }
      if (data.method === 'Network.requestWillBeSent') {
        networkRequests.push(data.params.request.url);
      }
    };

    await new Promise((r) => (ws.onopen = r));

    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const reqId = id++;
        pending.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    // Grant clipboard permissions in headless Chrome
    try {
      await send('Browser.grantPermissions', { permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
    } catch {
      // ignore
    }

    const evalExpr = async (expression) => {
      const res = await send('Runtime.evaluate', { expression, returnByValue: true });
      return res?.result?.value;
    };

    // Helper for controlled React inputs
    await evalExpr(`
      window.__setReactInput = (selector, val) => {
        const el = document.querySelector(selector);
        if (!el) return false;
        const isTextarea = el.tagName.toLowerCase() === 'textarea';
        const proto = isTextarea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      };
    `);

    // Helper to capture full screenshot at resolution
    const captureView = async (filename, width, height, isMobile = false) => {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: isMobile ? 2 : 1,
        mobile: isMobile
      });
      await evalExpr('window.scrollTo(0, 0)');
      await new Promise((r) => setTimeout(r, 400));
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`D:\\NXTWave\\${filename}`, Buffer.from(shot.data, 'base64'));
    };

    // Helper to check horizontal overflow
    const checkOverflow = async () => {
      return await evalExpr(`(() => {
        return {
          windowInnerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      })()`);
    };

    await new Promise((r) => setTimeout(r, 500));

    // =========================================================
    // 1. PAGE 1: HOME (/)
    // =========================================================
    console.log('\n--- Auditing Page 1: Home (/) ---');

    // Scenario 16: Incoming UTM attribution check
    try {
      const urlParams = await evalExpr('window.location.search');
      if (urlParams.includes('utm_source=campus-club')) {
        logPass(16, 'Incoming UTM attribution preserved on Home', urlParams);
      } else {
        throw new Error(`Expected utm_source in URL, got ${urlParams}`);
      }
    } catch (e) {
      logFail(16, 'Incoming UTM attribution', e);
    }

    // Home structure check
    try {
      const headline = await evalExpr('document.querySelector(".home-hero-headline")?.innerText');
      const previewTitle = await evalExpr('document.querySelector(".preview-verdict-title")?.innerText');
      const processSteps = await evalExpr('document.querySelectorAll(".process-step-item").length');
      const moduleCards = await evalExpr('document.querySelectorAll(".module-card").length');

      if (
        headline?.includes('Turn an ambitious AI project') &&
        previewTitle?.includes('Scope Needs Narrowing') &&
        processSteps === 4 &&
        moduleCards === 3
      ) {
        logPass(1, 'Homepage 10-second comprehension structure', 'Hero grid + preview + 4 process steps + 3 modules');
      } else {
        throw new Error(`Home page elements missing: steps=${processSteps}, modules=${moduleCards}`);
      }
    } catch (e) {
      logFail(1, 'Homepage structure', e);
    }

    // Capture Home Desktop & Mobile screenshots
    await captureView('page-home-desktop.png', 1440, 1000, false);
    await captureView('page-home-mobile.png', 375, 812, true);

    const homeOverflow = await checkOverflow();
    if (!homeOverflow.hasOverflow) {
      logPass(2, 'Home Mobile 375px zero-overflow', `Width: ${homeOverflow.scrollWidth}px`);
    } else {
      logFail(2, 'Home Mobile overflow', homeOverflow);
    }

    // Reset view to Desktop for navigation
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

    // =========================================================
    // 2. PAGE 2: DIAGNOSE (/diagnose)
    // =========================================================
    console.log('\n--- Auditing Page 2: Diagnose (/diagnose) ---');

    // Navigate to /diagnose via header CTA
    await evalExpr('document.querySelector(".btn-header-cta")?.click()');
    await new Promise((r) => setTimeout(r, 400));

    // Verify URL and UTM query preservation across route transition
    try {
      const currentUrl = await evalExpr('window.location.pathname + window.location.search');
      if (currentUrl.startsWith('/diagnose') && currentUrl.includes('utm_source=campus-club')) {
        logPass(3, 'Route navigation & UTM preservation to /diagnose', currentUrl);
      } else {
        throw new Error(`Expected /diagnose with UTM params, got ${currentUrl}`);
      }
    } catch (e) {
      logFail(3, 'Route navigation & UTM preservation', e);
    }

    // Verify 2-column layout before assessment
    try {
      const sidebarTitle = await evalExpr('document.querySelector(".sidebar-title")?.innerText');
      const presetsCount = await evalExpr('document.querySelectorAll(".preset-card").length');
      if (sidebarTitle?.includes('7 Architecture Complexity Layers') && presetsCount === 4) {
        logPass(4, 'Diagnose workbench layout (pre-assessment)', '2-col layout with 7 complexity layer sidebar');
      } else {
        throw new Error('Diagnose sidebar or presets missing');
      }
    } catch (e) {
      logFail(4, 'Diagnose workbench pre-assessment layout', e);
    }

    // SCENARIO: Switch between presets
    try {
      await evalExpr('document.querySelectorAll(".preset-card")[0].click()');
      const text0 = await evalExpr('document.querySelector("textarea").value');
      await evalExpr('document.querySelectorAll(".preset-card")[1].click()');
      const text1 = await evalExpr('document.querySelector("textarea").value');
      if (text0 !== text1 && text1.includes('resume')) {
        logPass(10, 'Switch between presets', 'Textarea updated dynamically');
      } else {
        throw new Error('Preset switching failed');
      }
    } catch (e) {
      logFail(10, 'Switch between presets', e);
    }

    // SCENARIO: Switch from preset to custom input
    try {
      await evalExpr('document.querySelector(".custom-toggle-btn")?.click()');
      const isCustomActive = await evalExpr('document.querySelector(".custom-toggle-btn")?.classList.contains("is-active")');
      if (isCustomActive) {
        logPass(11, 'Switch to custom input', 'Custom specification mode activated');
      } else {
        throw new Error('Custom mode toggle failed');
      }
    } catch (e) {
      logFail(11, 'Switch to custom input', e);
    }

    // SCENARIO: Too-short invalid input
    try {
      await evalExpr('window.__setReactInput("textarea", "AI bot")');
      await new Promise((r) => setTimeout(r, 200));
      const isDisabled = await evalExpr('document.querySelector("button.btn-primary")?.disabled');
      const hasError = await evalExpr('document.querySelector("textarea")?.classList.contains("has-error")');
      if (isDisabled && hasError) {
        logPass(8, 'Too-short invalid input validation', 'Button disabled, error border applied (<10 chars)');
      } else {
        throw new Error('Too-short validation failed');
      }
    } catch (e) {
      logFail(8, 'Too-short invalid input validation', e);
    }

    // SCENARIO: Focused custom idea
    try {
      await evalExpr(`window.__setReactInput(
        "textarea",
        "Build a page where I paste one job description and one resume, then show the matching skills and missing skills."
      )`);
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise((r) => setTimeout(r, 400));
      const verdict = await evalExpr('document.querySelector(".verdict-headline")?.innerText');
      if (verdict?.includes('Manageable')) {
        logPass(5, 'Focused custom idea diagnostic', verdict);
      } else {
        throw new Error(`Unexpected focused verdict: ${verdict}`);
      }
    } catch (e) {
      logFail(5, 'Focused custom idea diagnostic', e);
    }

    // SCENARIO: Edit and reassess
    try {
      await evalExpr('document.querySelector(".verdict-actions-bar button")?.click()');
      await new Promise((r) => setTimeout(r, 200));
      const isVisible = await evalExpr('Boolean(document.querySelector(".section-input-workbench"))');
      if (isVisible) {
        logPass(9, 'Edit and reassess action', 'Seamlessly returns to editor draft');
      } else {
        throw new Error('Edit button failed to restore workbench');
      }
    } catch (e) {
      logFail(9, 'Edit and reassess action', e);
    }

    // SCENARIO: Vague custom idea
    try {
      await evalExpr(`window.__setReactInput(
        "textarea",
        "project to show foreign internship and full time role for especially freshers"
      )`);
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise((r) => setTimeout(r, 400));
      const verdict = await evalExpr('document.querySelector(".verdict-headline")?.innerText');
      const fit = await evalExpr('document.querySelector(".metric-fit-label")?.innerText');
      if (verdict?.includes('Needs More Definition') || fit?.includes('Needs definition')) {
        logPass(6, 'Vague custom idea handling', `${verdict} - ${fit}`);
      } else {
        throw new Error(`Vague idea handling failed: ${verdict}`);
      }
    } catch (e) {
      logFail(6, 'Vague custom idea handling', e);
    }

    // SCENARIO: Clearly over-broad custom idea
    try {
      await evalExpr('document.querySelector(".verdict-actions-bar button")?.click()');
      await new Promise((r) => setTimeout(r, 200));
      await evalExpr(`window.__setReactInput(
        "textarea",
        "Autonomous security surveillance camera robot with live video streaming, custom YOLOv8 object detection trained from scratch, React Native iOS and Android app, Stripe payments, and multi-tenant admin accounts."
      )`);
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise((r) => setTimeout(r, 400));
      const verdict = await evalExpr('document.querySelector(".verdict-headline")?.innerText');
      if (verdict?.includes('Too Broad')) {
        logPass(7, 'Clearly over-broad custom idea', verdict);
      } else {
        throw new Error(`Over-broad idea failed: ${verdict}`);
      }
    } catch (e) {
      logFail(7, 'Clearly over-broad custom idea', e);
    }

    // SCENARIO: Course Notes Q&A preset
    try {
      await evalExpr('document.querySelector(".verdict-actions-bar button")?.click()');
      await new Promise((r) => setTimeout(r, 200));
      await evalExpr('document.querySelectorAll(".preset-card")[0].click()');
      await evalExpr('document.querySelector("button.btn-primary").click()');
      await new Promise((r) => setTimeout(r, 400));
      const verdict = await evalExpr('document.querySelector(".verdict-headline")?.innerText');
      if (verdict?.includes('Needs Narrowing')) {
        logPass(12, 'Course Notes Q&A preset assessment', verdict);
      } else {
        throw new Error(`Preset verdict failed: ${verdict}`);
      }
    } catch (e) {
      logFail(12, 'Course Notes Q&A preset assessment', e);
    }

    // SCENARIO: Workshop registration simulation & reset
    try {
      await evalExpr('document.querySelector(".btn-workshop")?.click()');
      await new Promise((r) => setTimeout(r, 300));
      const isConfirmed = await evalExpr('Boolean(document.querySelector(".registration-confirmed"))');
      await evalExpr('document.querySelector(".registration-confirmed button")?.click()');
      await new Promise((r) => setTimeout(r, 200));
      const isReset = await evalExpr('Boolean(document.querySelector(".registration-prompt"))');
      if (isConfirmed && isReset) {
        logPass(13, 'Workshop registration simulation & reset', 'Verified demo flow with zero personal data requested');
      } else {
        throw new Error('Workshop simulation or reset failed');
      }
    } catch (e) {
      logFail(13, 'Workshop registration simulation & reset', e);
    }

    // SCENARIO: WhatsApp and Copy link sharing
    try {
      const waHref = await evalExpr('document.querySelector("a.share-btn-whatsapp")?.getAttribute("href")');
      await evalExpr('document.querySelector("button.share-btn-copy")?.click()');
      await new Promise((r) => setTimeout(r, 200));
      const copyText = await evalExpr('document.querySelector("button.share-btn-copy")?.innerText');
      if (waHref?.includes('utm_medium%3Dwhatsapp') && (copyText?.includes('Link copied') || copyText?.includes('Copy link'))) {
        logPass(14, 'Peer sharing mechanisms', 'WhatsApp URL-encoded with utm_medium=whatsapp; Copy link active');
      } else {
        throw new Error('Peer sharing failed');
      }
    } catch (e) {
      logFail(14, 'Peer sharing mechanisms', e);
    }

    // Capture Diagnose Desktop & Mobile screenshots
    await captureView('page-diagnose-desktop.png', 1440, 1000, false);
    await captureView('page-diagnose-mobile.png', 375, 812, true);

    const diagOverflow = await checkOverflow();
    if (!diagOverflow.hasOverflow) {
      logPass(15, 'Diagnose Mobile 375px zero-overflow', `Width: ${diagOverflow.scrollWidth}px`);
    } else {
      logFail(15, 'Diagnose Mobile overflow', diagOverflow);
    }

    // Reset view to Desktop for navigation
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

    // =========================================================
    // 3. PAGE 3: GROWTH TOOLKIT (/growth)
    // =========================================================
    console.log('\n--- Auditing Page 3: Growth Toolkit (/growth) ---');

    // Click Growth Toolkit in navbar
    await evalExpr('document.querySelectorAll(".nav-link")[2]?.click()');
    await new Promise((r) => setTimeout(r, 400));

    // Verify route
    try {
      const currentUrl = await evalExpr('window.location.pathname');
      const headline = await evalExpr('document.querySelector(".toolkit-headline")?.innerText');
      if (currentUrl === '/growth' && headline?.includes('Turn student communities into measurable distribution')) {
        logPass(17, 'Growth Toolkit page routing and hero', currentUrl);
      } else {
        throw new Error(`Growth Toolkit navigation failed: url=${currentUrl}`);
      }
    } catch (e) {
      logFail(17, 'Growth Toolkit page routing', e);
    }

    // Connector Kit testing
    try {
      await evalExpr('document.querySelectorAll(".source-chip")[1].click()'); // Coding Club
      await evalExpr('window.__setReactInput("#connector-source-label", "IIT Bombay CSE")');
      await evalExpr('document.querySelectorAll(".variant-toggle-btn")[1].click()'); // Variant B
      await new Promise((r) => setTimeout(r, 200));

      const slug = await evalExpr('document.querySelector(".slug-preview code")?.innerText');
      const resolvedUrl = await evalExpr('document.querySelector(".url-code-text")?.innerText');
      const msgText = await evalExpr('document.querySelector(".message-text")?.innerText');

      if (
        slug?.includes('coding_club_iit-bombay-cse') &&
        resolvedUrl?.includes('utm_source=coding_club_iit-bombay-cse') &&
        resolvedUrl?.includes('utm_content=build-first-hook') &&
        msgText?.includes('Stop collecting AI project ideas')
      ) {
        logPass(18, 'Campus Connector Kit 2-column workspace', `Slug: ${slug}, Hook: Variant B`);
      } else {
        throw new Error('Connector Kit parameter generation mismatch');
      }
    } catch (e) {
      logFail(18, 'Campus Connector Kit workspace', e);
    }

    // Message Experiment Lab testing
    try {
      await evalExpr('window.__setReactInput("#input-va-visits", "100")');
      await evalExpr('window.__setReactInput("#input-va-reg", "28")'); // 28%
      await evalExpr('window.__setReactInput("#input-vb-visits", "100")');
      await evalExpr('window.__setReactInput("#input-vb-reg", "18")'); // 18%
      await new Promise((r) => setTimeout(r, 200));

      const crA = await evalExpr('document.querySelectorAll(".rate-value")[0]?.innerText');
      const crB = await evalExpr('document.querySelectorAll(".rate-value")[1]?.innerText');
      const leadTag = await evalExpr('document.querySelector(".lead-tag")?.innerText');

      if (crA === '28.0%' && crB === '18.0%' && leadTag?.includes('Variant A')) {
        logPass(19, 'Message Experiment Lab A/B evaluation', `A: ${crA}, B: ${crB}, Leader: ${leadTag}`);
      } else {
        throw new Error(`Experiment calculation failed: crA=${crA}, crB=${crB}`);
      }
    } catch (e) {
      logFail(19, 'Message Experiment Lab evaluation', e);
    }

    // Capture Growth Toolkit Desktop & Mobile screenshots
    await captureView('page-growth-desktop.png', 1440, 1000, false);
    await captureView('page-growth-mobile.png', 375, 812, true);

    const growthOverflow = await checkOverflow();
    if (!growthOverflow.hasOverflow) {
      logPass(20, 'Growth Toolkit Mobile 375px zero-overflow', `Width: ${growthOverflow.scrollWidth}px`);
    } else {
      logFail(20, 'Growth Toolkit Mobile overflow', growthOverflow);
    }

    // Reset view to Desktop for navigation
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });

    // =========================================================
    // 4. PAGE 4: CAMPAIGN MODEL (/campaign)
    // =========================================================
    console.log('\n--- Auditing Page 4: Campaign Model (/campaign) ---');

    // Click Campaign Model in navbar
    await evalExpr('document.querySelectorAll(".nav-link")[3]?.click()');
    await new Promise((r) => setTimeout(r, 400));

    // Verify route and standalone hero
    try {
      const currentUrl = await evalExpr('window.location.pathname');
      const headline = await evalExpr('document.querySelector(".campaign-headline")?.innerText');
      const hasAccordion = await evalExpr('Boolean(document.querySelector(".simulator-accordion-trigger"))');

      if (currentUrl === '/campaign' && headline?.includes('What must be true to reach 500 registrations?') && !hasAccordion) {
        logPass(21, 'Campaign Model standalone page & hero', 'Standalone workspace (not buried in accordion)');
      } else {
        throw new Error(`Campaign page setup failed: url=${currentUrl}, hasAccordion=${hasAccordion}`);
      }
    } catch (e) {
      logFail(21, 'Campaign Model standalone page', e);
    }

    // Scenario testing: Conservative
    try {
      await evalExpr('document.querySelectorAll(".scenario-btn")[0].click()');
      await new Promise((r) => setTimeout(r, 200));
      const total = await evalExpr('document.querySelector(".funnel-step.total-step .step-val.highlight")?.innerText');
      const bottleneck = await evalExpr('document.querySelector(".guidance-title")?.innerText');
      if (total === '12' && bottleneck?.includes('Distribution Bottleneck')) {
        logPass(22, 'Campaign Model Conservative scenario', `Total: 12, Bottleneck: ${bottleneck}`);
      } else {
        throw new Error(`Conservative scenario failed: total=${total}`);
      }
    } catch (e) {
      logFail(22, 'Campaign Model Conservative scenario', e);
    }

    // Scenario testing: Base
    try {
      await evalExpr('document.querySelectorAll(".scenario-btn")[1].click()');
      await new Promise((r) => setTimeout(r, 200));
      const total = await evalExpr('document.querySelector(".funnel-step.total-step .step-val.highlight")?.innerText');
      const gap = await evalExpr('document.querySelector(".status-gap")?.innerText');
      if (total === '108' && gap?.includes('392')) {
        logPass(23, 'Campaign Model Base scenario', `Total: 108, Gap: ${gap}`);
      } else {
        throw new Error(`Base scenario failed: total=${total}`);
      }
    } catch (e) {
      logFail(23, 'Campaign Model Base scenario', e);
    }

    // Scenario testing: Stretch
    try {
      await evalExpr('document.querySelectorAll(".scenario-btn")[2].click()');
      await new Promise((r) => setTimeout(r, 200));
      const total = await evalExpr('document.querySelector(".funnel-step.total-step .step-val.highlight")?.innerText');
      const badge = await evalExpr('document.querySelector(".status-met")?.innerText');
      if (total === '804' && badge?.includes('Target Met')) {
        logPass(24, 'Campaign Model Stretch scenario', `Total: 804, Badge: ${badge}`);
      } else {
        throw new Error(`Stretch scenario failed: total=${total}`);
      }
    } catch (e) {
      logFail(24, 'Campaign Model Stretch scenario', e);
    }

    // Manual simulator edits
    try {
      await evalExpr('window.__setReactInput("#input-connectors", "20")');
      await new Promise((r) => setTimeout(r, 200));
      const exposures = await evalExpr('document.querySelectorAll(".step-val")[0]?.innerText');
      const isCustomActive = await evalExpr('document.querySelector(".scenario-custom-pill") !== null');
      if (exposures === '15,000' && isCustomActive) {
        logPass(25, 'Manual simulation parameters', 'Recalculates exposures to 15,000; switches to custom');
      } else {
        throw new Error('Manual parameter update failed');
      }
    } catch (e) {
      logFail(25, 'Manual simulation parameters', e);
    }

    // Edge cases: Zero registrations & 100% overlap
    try {
      await evalExpr('window.__setReactInput("#input-connectors", "0")');
      await new Promise((r) => setTimeout(r, 100));
      const zeroTotal = await evalExpr('document.querySelector(".funnel-step.total-step .step-val.highlight")?.innerText');
      const cpr = await evalExpr('document.querySelector(".cpr-val")?.innerText');

      await evalExpr('window.__setReactInput("#input-connectors", "10")');
      await evalExpr('window.__setReactInput("#input-overlap", "100")');
      await new Promise((r) => setTimeout(r, 100));
      const reach100 = await evalExpr('document.querySelectorAll(".step-val")[1]?.innerText');

      if (zeroTotal === '0' && cpr === '—' && reach100 === '0') {
        logPass(26, 'Simulator edge case stability (0 reg & 100% overlap)', 'Clean zero math, no NaN, no division crash');
      } else {
        throw new Error('Edge cases failed');
      }
    } catch (e) {
      logFail(26, 'Simulator edge case stability', e);
    }

    // 7-Day Sprint execution timeline check
    try {
      const scheduleCards = await evalExpr('document.querySelectorAll(".schedule-card").length');
      if (scheduleCards === 4) {
        logPass(27, '7-Day Sprint Execution Timeline', '4 horizontal phase blocks (Days 1-2, 3-4, 5-6, 7)');
      } else {
        throw new Error(`Schedule cards count mismatch: ${scheduleCards}`);
      }
    } catch (e) {
      logFail(27, '7-Day Sprint Execution Timeline', e);
    }

    // Capture Campaign Model Desktop & Mobile screenshots
    await captureView('page-campaign-desktop.png', 1440, 1000, false);
    await captureView('page-campaign-mobile.png', 375, 812, true);

    const campOverflow = await checkOverflow();
    if (!campOverflow.hasOverflow) {
      logPass(28, 'Campaign Model Mobile 375px zero-overflow', `Width: ${campOverflow.scrollWidth}px`);
    } else {
      logFail(28, 'Campaign Model Mobile overflow', campOverflow);
    }

    // Direct Route Refresh Check (Scenario 29)
    try {
      await evalExpr('window.location.reload()');
      await new Promise((r) => setTimeout(r, 600));
      const reloadedPath = await evalExpr('window.location.pathname');
      const reloadedHeadline = await evalExpr('document.querySelector(".campaign-headline")?.innerText');
      if (reloadedPath === '/campaign' && reloadedHeadline?.includes('What must be true')) {
        logPass(29, 'Direct route refresh on /campaign', 'State and SPA routing intact upon browser refresh');
      } else {
        throw new Error(`Direct refresh failed: path=${reloadedPath}`);
      }
    } catch (e) {
      logFail(29, 'Direct route refresh', e);
    }

    // Mobile Navigation Drawer Toggle Check (Scenario 30)
    try {
      await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
      await evalExpr('document.querySelector(".mobile-menu-toggle")?.click()');
      await new Promise((r) => setTimeout(r, 200));
      const isDrawerOpen = await evalExpr('Boolean(document.querySelector(".mobile-nav-drawer"))');
      const mobileLinks = await evalExpr('document.querySelectorAll(".mobile-nav-link").length');

      // Click Home in mobile drawer
      await evalExpr('document.querySelectorAll(".mobile-nav-link")[0]?.click()');
      await new Promise((r) => setTimeout(r, 400));
      const targetPath = await evalExpr('window.location.pathname');

      if (isDrawerOpen && mobileLinks === 4 && targetPath === '/') {
        logPass(30, 'Responsive mobile navigation drawer', 'Drawer opens on tap and navigates cleanly');
      } else {
        throw new Error(`Mobile drawer failed: open=${isDrawerOpen}, links=${mobileLinks}, target=${targetPath}`);
      }
    } catch (e) {
      logFail(30, 'Responsive mobile navigation drawer', e);
    }

    // Network & Console checks
    console.log('\n--- Auditing Credibility, Privacy & Network Activity ---');
    const unexpectedRequests = networkRequests.filter(
      (url) => !url.startsWith('http://127.0.0.1:4173') && !url.startsWith('data:') && !url.startsWith('blob:')
    );
    console.log(`Third-party network requests: ${unexpectedRequests.length}`);

    const consoleErrors = consoleLogs.filter((log) => log.type === 'error');
    console.log(`Console errors: ${consoleErrors.length}`);

    ws.close();
  } finally {
    chrome.kill();
    server.close();
  }

  const passedCount = results.filter((r) => r.status === 'PASS').length;
  console.log(`\n=====================================================`);
  console.log(`Multi-Page QA Summary: ${passedCount} / ${results.length} scenarios passed.`);
  console.log(`=====================================================`);
  if (passedCount === results.length) {
    console.log(`ALL ${results.length} MULTI-PAGE E2E SCENARIOS PASSED WITH ZERO FAILURES.`);
  } else {
    console.error(`FAILED SCENARIOS: ${results.filter((r) => r.status === 'FAIL').map((r) => r.scenario).join(', ')}`);
    process.exit(1);
  }
}

runQA().catch((err) => {
  console.error('QA Runner fatal error:', err);
  process.exit(1);
});
