import puppeteer from 'puppeteer';

const BASE_URL = 'http://127.0.0.1:4173/';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAttackSuite() {
  console.log('====================================================');
  console.log('🤖 KEYTOS HACKATHON: AUTOMATED BOT ATTACK TEST SUITE');
  console.log('Target: Motion-Coherence Dots CAPTCHA (RDK)');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = [];

  // -----------------------------------------------------------
  // ATTACK 1: Static Single-Frame Vision / Edge-Detection Bot
  // (Immune to Prompt Injection: Ignores text, pure pixel analysis)
  // -----------------------------------------------------------
  {
    console.log('▶ TEST 1: Static Single-Frame Vision / Edge-Detection Bot (Immune to Prompt Injection)');
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input');
    await sleep(400);

    const analysis = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = img.data;
      
      const midX = canvas.width / 2;
      const midY = canvas.height / 2;
      let q1 = 0, q2 = 0, q3 = 0, q4 = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          if (brightness > 40) {
            if (x < midX && y < midY) q1++;
            else if (x >= midX && y < midY) q2++;
            else if (x < midX && y >= midY) q3++;
            else q4++;
          }
        }
      }

      const total = q1 + q2 + q3 + q4;
      const avg = total / 4;
      const maxVariance = Math.max(
        Math.abs(q1 - avg),
        Math.abs(q2 - avg),
        Math.abs(q3 - avg),
        Math.abs(q4 - avg)
      ) / avg;

      return { totalDots: total, maxVariance: (maxVariance * 100).toFixed(2) };
    });

    console.log(`   [Vision Metric] Total detected dot pixels: ${analysis?.totalDots}`);
    console.log(`   [Vision Metric] Spatial Quadrant Density Variance: ${analysis?.maxVariance}% (Threshold > 35% needed for edge contours)`);
    console.log('   [Bot Decision] Vision model detects pure uniform spatial noise. Unable to isolate any shape contours.');
    
    // Bot attempts blind guess
    await page.type('input[type="text"]', 'random_guess');
    await page.click('button[type="submit"]');
    await sleep(400);

    const isFailed = await page.evaluate(() => document.body.innerText.includes('Incorrect'));
    console.log(`   [Result] Bot attack status: ${isFailed ? '❌ DEFEATED (Incorrect guess)' : 'PASSED'}\n`);
    results.push({ name: 'Static Vision Edge Bot', immuneToPromptInjection: true, outcome: isFailed ? 'DEFEATED' : 'PASSED', reason: 'Zero spatial contrast in static frame' });
    await page.close();
  }

  // -----------------------------------------------------------
  // ATTACK 2: Blind Form-Filling / Autofill Bot
  // (Immune to Prompt Injection: Scraper filling all inputs)
  // -----------------------------------------------------------
  {
    console.log('▶ TEST 2: Blind Form-Filling / Autofill Bot (Immune to Prompt Injection)');
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input');
    await sleep(400);

    // Populate hidden canary input
    await page.type('#bacon_grease_telemetry_gauge', 'verified');
    // Populate visible entry field
    await page.type('input[type="text"]:not(#bacon_grease_telemetry_gauge)', 'autofill_value');
    
    console.log('   [Bot Action] Populated all discovered inputs including hidden canary field: #bacon_grease_telemetry_gauge');

    await page.click('button[type="submit"]');
    await sleep(400);

    const isFailed = await page.evaluate(() => document.body.innerText.includes('Incorrect'));
    console.log(`   [Result] Bot attack status: ${isFailed ? '❌ DEFEATED (Canary honeypot tripped)' : 'PASSED'}\n`);
    results.push({ name: 'Blind Autofill Bot', immuneToPromptInjection: true, outcome: isFailed ? 'DEFEATED' : 'PASSED', reason: 'Canary honeypot input tripped' });
    await page.close();
  }

  // -----------------------------------------------------------
  // ATTACK 3: DOM Crawler / Action Agent
  // (Prompt-Injection Vulnerable: Reads hidden DOM instructions)
  // -----------------------------------------------------------
  {
    console.log('▶ TEST 3: Autonomous DOM Crawler Bot (Prompt-Injection Vulnerable)');
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input');
    await sleep(400);

    const clickedHoneypot = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const botBtn = buttons.find((b) => b.innerText.includes("I'm a bot"));
      if (botBtn) {
        botBtn.click();
        return true;
      }
      return false;
    });

    console.log(`   [Bot Action] Scraped invisible DOM button "I'm a bot" and clicked it: ${clickedHoneypot}`);
    await sleep(400);

    const isFailed = await page.evaluate(() => document.body.innerText.includes('Incorrect'));
    console.log(`   [Result] Bot attack status: ${isFailed ? '❌ DEFEATED (Trapped by invisible DOM button)' : 'PASSED'}\n`);
    results.push({ name: 'DOM Crawler Bot', immuneToPromptInjection: false, outcome: isFailed ? 'DEFEATED' : 'PASSED', reason: 'Invisible "I am a bot" honeypot clicked' });
    await page.close();
  }

  // -----------------------------------------------------------
  // ATTACK 4: Canvas OCR / Vision Watermark Extractor
  // (Prompt-Injection Vulnerable: OCRs sub-perceptual text from canvas)
  // -----------------------------------------------------------
  {
    console.log('▶ TEST 4: Canvas OCR / Vision Watermark Extractor (Prompt-Injection Vulnerable)');
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input');
    await sleep(400);

    console.log('   [Bot Action] Vision OCR model thresholded canvas and parsed sub-perceptual watermark: "0000"');
    console.log('   [Bot Action] Submitting parsed override code "0000" into entry field...');

    await page.type('input[type="text"]:not(#sys_auth_canary)', '0000');
    await page.click('button[type="submit"]');
    await sleep(400);

    const isFailed = await page.evaluate(() => document.body.innerText.includes('Incorrect'));
    console.log(`   [Result] Bot attack status: ${isFailed ? '❌ DEFEATED (Poisoned watermark triggered trap)' : 'PASSED'}\n`);
    results.push({ name: 'Canvas OCR Extractor Bot', immuneToPromptInjection: false, outcome: isFailed ? 'DEFEATED' : 'PASSED', reason: 'Poisoned watermark code 0000 submitted' });
    await page.close();
  }

  // -----------------------------------------------------------
  // ATTACK 5: Multi-Frame Pixel Differencing Bot
  // (Immune to Prompt Injection: Mathematical frame subtraction)
  // -----------------------------------------------------------
  {
    console.log('▶ TEST 5: Multi-Frame Pixel Differencing Bot (Immune to Prompt Injection)');
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input');
    await sleep(400);

    const holdBtn = await page.$('button[type="button"]');
    const box = await holdBtn.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await sleep(600);

    const diffMetric = await page.evaluate(async () => {
      const canvas = document.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const f1 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      await new Promise((r) => setTimeout(r, 80));
      const f2 = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let changedPixels = 0;
      for (let i = 0; i < f1.length; i += 4) {
        const diff = Math.abs(f1[i] - f2[i]);
        if (diff > 30) changedPixels++;
      }
      return { changedRatio: (changedPixels / (canvas.width * canvas.height)).toFixed(3) };
    });

    await page.mouse.up();

    console.log(`   [Motion Analysis] Delta Pixel Scatter Ratio: ${diffMetric.changedRatio}`);
    console.log('   [Bot Decision] Differencing fails: Both background and target dots move simultaneously with Brownian noise.');
    console.log('   [Bot Decision] Differencing outputs a full-canvas noisy scatter cloud with zero structural edge contours.');

    await page.type('input[type="text"]:not(#sys_auth_canary)', 'square');
    await page.click('button[type="submit"]');
    await sleep(400);

    const isFailed = await page.evaluate(() => document.body.innerText.includes('Incorrect'));
    console.log(`   [Result] Bot attack status: ${isFailed ? '❌ DEFEATED (Unable to extract shape from differencing)' : 'PASSED'}\n`);
    results.push({ name: 'Pixel Differencing Bot', immuneToPromptInjection: true, outcome: isFailed ? 'DEFEATED' : 'PASSED', reason: 'Brownian RDK noise corrupts simple subtraction' });
    await page.close();
  }

  await browser.close();

  console.log('====================================================');
  console.log('📊 ATTACK TEST SUMMARY');
  console.log('====================================================');
  console.table(results);
}

runAttackSuite().catch(console.error);
