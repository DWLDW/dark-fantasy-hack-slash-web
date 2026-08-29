import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const outDir = 'C:/game/_audit_shots';
fs.mkdirSync(outDir,{recursive:true});
const url = 'http://localhost:4173';
const shots=[];

async function capture(page, name, w, h){
  await page.setViewportSize({width:w, height:h});
  await page.waitForTimeout(800);
  const fp = path.join(outDir, name);
  await page.screenshot({path: fp, fullPage: false});
  console.log('SHOT', name, fs.statSync(fp).size);
  shots.push(name);
}

const browser = await chromium.launch({args:['--no-sandbox']});
const ctx = await browser.newContext();
const page = await ctx.newPage();

// desktop town
await page.goto(url, {waitUntil:'networkidle'});
await page.waitForTimeout(1500);
console.log('GOTO done', await page.title());
// dismiss tutorial if present
try{ await page.getByRole('button',{name:/시작|닫기|확인|건너뛰기|SKIP/i}).first().click({timeout:2000}); console.log('dismissed tutorial'); await page.waitForTimeout(600);}catch{}

// town desktop
await capture(page, 'audit_town_1440.png', 1440, 900);
// town mobile
await capture(page, 'audit_town_390.png', 390, 844);

// re-ensure desktop for rest
await page.setViewportSize({width:1440, height:900});
await page.waitForTimeout(500);

// Go to dungeon select via BottomDock -> 던전 or header world map
// Try click 던전 button
let clicked=false;
for(const sel of ['text=던전','text=던전 관문','text=월드맵','[data-tutorial=\"dungeon\"]']){
  try{ const el=page.locator(sel).first(); if(await el.count()>0){ await el.click({timeout:2000}); clicked=true; console.log('clicked dungeon via',sel); break; } }catch{}
}
if(!clicked){
  // try keyboard? maybe viewMode already town, try clicking TownMapCanvas world map
  try{ await page.locator('button:has-text("월드맵")').first().click({timeout:2000}); clicked=true; console.log('clicked via 월드맵 button'); }catch{}
}
await page.waitForTimeout(1200);
await capture(page, 'audit_dungeon_select_1440.png', 1440, 900);
await capture(page, 'audit_dungeon_select_390.png', 390, 844);
await page.setViewportSize({width:1440, height:900});
await page.waitForTimeout(500);

// Enter dungeon - find 출격 button
let entered=false;
for(const sel of ['button:has-text("출격")','button:has-text("돌입")','button:has-text("입장")','text=출격']){
  try{ const el=page.locator(sel).first(); if(await el.count()>0){ await el.click({timeout:3000}); entered=true; console.log('entered via',sel); break; } }catch{}
}
if(!entered){
  // keyboard Space
  try{ await page.keyboard.press('Space'); entered=true; console.log('entered via Space'); }catch{}
}
await page.waitForTimeout(2500);
// battle view
await capture(page, 'audit_battle_1440.png', 1440, 900);
await capture(page, 'audit_battle_390.png', 390, 844);
await page.setViewportSize({width:1440, height:900});
await page.waitForTimeout(500);

// Open modals via bottom dock C/I/K
try{ await page.keyboard.press('c'); await page.waitForTimeout(900); await capture(page, 'audit_modal_character_1440.png', 1440, 900); await page.keyboard.press('Escape'); await page.waitForTimeout(500);}catch(e){ console.log('char modal fail',e.message)}
try{ await page.keyboard.press('i'); await page.waitForTimeout(900); await capture(page, 'audit_modal_inventory_1440.png', 1440, 900); await page.keyboard.press('Escape'); await page.waitForTimeout(500);}catch(e){ console.log('inv modal fail',e.message)}
try{ await page.keyboard.press('k'); await page.waitForTimeout(900); await capture(page, 'audit_modal_skills_1440.png', 1440, 900); await page.keyboard.press('Escape'); await page.waitForTimeout(500);}catch(e){ console.log('skill modal fail',e.message)}

// Try inventory via click fallback
try{
  const invBtn=page.locator('button:has-text("가방"), button:has-text("인벤토리"), button:has-text("장비")').first();
  if(await invBtn.count()>0){ await invBtn.click({timeout:2000}); await page.waitForTimeout(900); await capture(page, 'audit_modal_inventory_click_1440.png', 1440, 900); await page.keyboard.press('Escape'); }
}catch{}

console.log('ALL SHOTS', shots);
await browser.close();
