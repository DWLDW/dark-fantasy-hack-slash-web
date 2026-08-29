import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path';
const outDir='C:/game/_audit_shots'; fs.mkdirSync(outDir,{recursive:true});
const url='http://localhost:4174';
async function cap(page,name,w,h){ await page.setViewportSize({width:w,height:h}); await page.waitForTimeout(800); const fp=path.join(outDir,name); await page.screenshot({path:fp,fullPage:false}); console.log('SHOT',name,fs.statSync(fp).size); }
const browser=await chromium.launch({args:['--no-sandbox']}); const ctx=await browser.newContext(); const page=await ctx.newPage();
await page.goto(url,{waitUntil:'networkidle'}); await page.waitForTimeout(1500);
console.log('title',await page.title());
try{ await page.getByRole('button',{name:/SKIP|시작|닫기/i}).first().click({timeout:2000}); await page.waitForTimeout(600);}catch{}
await cap(page,'post_town_1440.png',1440,900);
await cap(page,'post_town_390.png',390,844);
await page.setViewportSize({width:1440,height:900}); await page.waitForTimeout(500);
try{ const el=page.locator('text=던전').first(); if(await el.count()>0){ await el.click({timeout:2500}); console.log('clicked dungeon'); }}catch(e){console.log('click fail',e.message)}
await page.waitForTimeout(1200);
await cap(page,'post_dungeon_1440.png',1440,900);
await cap(page,'post_dungeon_390.png',390,844);
await page.setViewportSize({width:1440,height:900}); await page.waitForTimeout(500);
let entered=false; try{ const el=page.locator('button:has-text("출격")').first(); if(await el.count()>0){ await el.click({timeout:3000}); entered=true; console.log('entered via button'); }}catch{}
if(!entered){ await page.keyboard.press('Space'); console.log('entered via Space'); }
await page.waitForTimeout(2500);
await cap(page,'post_battle_1440.png',1440,900);
await cap(page,'post_battle_390.png',390,844);
console.log('done');
await browser.close();
