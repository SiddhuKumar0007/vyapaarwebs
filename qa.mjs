import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/sidhu/Documents/Codex/2026-11-02/files-pasted-by-the-user-you/work/browsers/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[],failures=[],results=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const check=(name,value)=>{results.push({name,passed:!!value});if(!value)failures.push(name);};
await mkdir('../qa',{recursive:true});
await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
await page.screenshot({path:'../qa/desktop.png',fullPage:false});
check('Six theme cards',await page.locator('.theme-card').count()===6);
await page.locator('#theme-search').fill('Maison');check('Search filters themes',await page.locator('.theme-card').count()===1);
await page.locator('#theme-search').fill('nothing-here');check('Search empty state',await page.locator('.empty-state').count()===1);
await page.locator('#reset-filters').click();check('Reset restores gallery',await page.locator('.theme-card').count()===6);
await page.locator('[data-category="Healthcare"]').click();check('Unbuilt category honest empty state',await page.locator('.empty-state').innerText().then(t=>t.includes('haven’t added')));
await page.locator('#reset-filters').click();await page.locator('[data-preview="estate"]').click();await page.frameLocator('#preview-frame').locator('h1').waitFor();
check('Live preview opens working internal demo',await page.frameLocator('#preview-frame').locator('h1').innerText().then(t=>t.includes('Space to live')));
await page.locator('[data-device="mobile"]').click();check('Mobile preview 375px',await page.locator('#preview-frame').evaluate(e=>Math.round(e.getBoundingClientRect().width))===375);
await page.keyboard.press('Escape');check('Escape closes preview',!(await page.locator('#preview-dialog').isVisible()));
await page.locator('[data-customize="restaurant"]').click();check('Customize prefills theme and industry',await page.locator('#builder-preview').innerText().then(t=>t.includes('restaurant')));
await page.locator('[data-choice="Luxury"]').click();await page.locator('#brand-color').fill('#123456');await page.locator('#builder-font').selectOption('Georgia');
await page.locator('#builder-next').click();await page.locator('.feature-options input[value="Appointment booking"]').check();await page.locator('#builder-next').click();
await page.locator('#builder-next').click();check('Builder requires business name',await page.locator('#builder-business').isVisible());
await page.locator('#builder-business').fill('Studio & Sons');await page.locator('#builder-details').fill('A welcoming restaurant website with booking enquiries.');await page.locator('#builder-next').click();
check('Builder summary has selections',await page.locator('.summary-list').innerText().then(t=>t.includes('Studio & Sons')&&t.includes('#123456')&&t.includes('Appointment booking')));
check('Next hidden on summary',!(await page.locator('#builder-next').isVisible()));
const briefHref=await page.locator('.summary-actions a').getAttribute('href');check('WhatsApp URL encoded configuration',new URL(briefHref).searchParams.get('text').includes('Studio & Sons'));
await page.locator('#builder-back').click();check('Can revise prior step',await page.locator('#builder-business').inputValue()==='Studio & Sons');
await page.locator('[data-prompt="0"]').click();await page.locator('[data-prompt="2"]').click();await page.locator('[data-mood="Elegant"]').click();
const dreamMessage=new URL(await page.locator('#dream-send').getAttribute('href')).searchParams.get('text');check('Dream brief combines prompts, moods and config',dreamMessage.includes('luxury black-and-gold')&&dreamMessage.includes('minimalist portfolio')&&dreamMessage.includes('Elegant')&&dreamMessage.includes('Studio & Sons'));
await page.locator('#faq-list summary').first().click();check('FAQ expands',await page.locator('#faq-list details').first().getAttribute('open')!==null);
await page.locator('#process-tab-0').focus();await page.keyboard.press('ArrowRight');check('Process keyboard navigation',await page.locator('#process-tab-1').getAttribute('aria-selected')==='true');
await page.evaluate(()=>{window.__opened=[];window.open=(url)=>{window.__opened.push(url);return null;};});
await page.locator('[name="name"]').fill('QA Person');await page.locator('[name="business"]').fill('Test & Company');await page.locator('[name="phone"]').fill('+91 9999999999');await page.locator('[name="type"]').selectOption('Business website');await page.locator('[name="description"]').fill('A test enquiry with spaces & symbols.');await page.locator('#contact-form button[type="submit"]').click();
const sent=await page.evaluate(()=>window.__opened);check('Contact generates WhatsApp without sending',sent.length===1&&new URL(sent[0]).searchParams.get('text').includes('Test & Company'));check('Contact has persistent handoff link',await page.locator('#contact-result a').count()===1);
await page.locator('[name="phone"]').fill('12');await page.locator('#contact-form button[type="submit"]').click();check('Invalid phone blocked',await page.evaluate(()=>window.__opened.length)===1);
check('All image assets load',await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});check(`Main has no overflow at ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width===390){await page.screenshot({path:'../qa/mobile.png',fullPage:true});await page.locator('.menu-toggle').click();check('Mobile menu opens',await page.locator('#main-nav').isVisible());await page.locator('#main-nav a[href="#themes"]').click();check('Mobile menu closes on navigation',!(await page.locator('#main-nav').isVisible()));}}
for(const id of ['estate','restaurant','fashion','business','portfolio','fitness']){await page.setViewportSize({width:1280,height:900});await page.goto(`http://127.0.0.1:4173/demos/${id}/`,{waitUntil:'networkidle'});check(`${id} renders`,await page.locator('h1').count()===1);check(`${id} images load`,await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));await page.screenshot({path:`../qa/demo-${id}.png`,fullPage:false});
 if(id==='estate'){await page.locator('[data-property="Apartment"]').click();check('Estate filters properties',await page.locator('.property-card').count()===1);}
 if(id==='restaurant'){await page.locator('[data-menu="Sweets"]').click();check('Restaurant menu tabs',await page.locator('#menu-items').innerText().then(t=>t.includes('chocolate tart')));await page.locator('[name="guest"]').fill('Sample visitor');await page.locator('[name="date"]').fill('2027-01-10');await page.locator('#reservation-form button').click();check('Reservation explicitly only a sample',await page.locator('#reservation-result').innerText().then(t=>t.includes('No table is booked')));}
 if(id==='fashion'){await page.locator('[data-add="1"]').click();await page.locator('[data-add="2"]').click();await page.locator('#bag-open').click();check('Bag adds products and totals',await page.locator('#bag-total').innerText()==='Sample total: ₹5,000');await page.locator('[data-remove="1"]').click();check('Bag removes products',await page.locator('#bag-total').innerText()==='Sample total: ₹3,200');await page.keyboard.press('Escape');await page.locator('#product-sort').selectOption('low');check('Price sorting',await page.locator('.product-title h3').first().innerText()==='The Studio Tote');}
 if(id==='business'){await page.locator('[data-expertise="2"]').click();check('Business service interaction',await page.locator('#expertise-panel').innerText().then(t=>t.includes('technology')));}
 if(id==='portfolio'){await page.locator('[data-work="Digital"]').click();check('Portfolio filter',await page.locator('.work-card').count()===2);await page.locator('.work-card').first().click();check('Portfolio project modal',await page.locator('#project-dialog').isVisible());await page.keyboard.press('Escape');}
 if(id==='fitness'){await page.locator('[data-day="Wednesday"]').click();check('Fitness schedule switches',await page.locator('#class-list').innerText().then(t=>t.includes('Mobility & Flow')));}
 for(const width of [768,390,320]){await page.setViewportSize({width,height:900});check(`${id} no overflow at ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
}
await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173');check('Reduced motion CSS',await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto');
await page.setViewportSize({width:1200,height:630});await page.goto('http://127.0.0.1:4173/assets/social.svg');await page.screenshot({path:'dist/assets/social.png'});
await browser.close();await writeFile('../qa/results.json',JSON.stringify({results,errors,failures},null,2));console.log(JSON.stringify({passed:results.filter(r=>r.passed).length,total:results.length,errors,failures},null,2));if(failures.length||errors.length)process.exitCode=1;
