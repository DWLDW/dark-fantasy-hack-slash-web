import fs from "fs";
function calculateDamageMultiplier(attackerLevel, targetDefense){
  const K=100+attackerLevel*10; return Math.max(0.05, Math.min(1.0, K/(K+Math.max(0,targetDefense))));
}
function getMonsterBaseStats(recLv){
  const baseHp=recLv<=10?Math.floor(18+recLv*6):Math.floor(40+recLv*7.5+Math.pow(recLv/10,1.5)*10);
  const baseDef=recLv<=10?Math.max(0,Math.floor((recLv-1)*1.1)):Math.floor(4+recLv*0.85);
  const baseDmg=recLv<=10?Math.max(2,Math.floor(2+recLv*0.45)):Math.floor(5+recLv*0.65);
  return {baseHp,baseDef,baseDmg};
}
function getMonsterScaled(recLv, playerLevel, diff){
  const {baseHp,baseDef,baseDmg}=getMonsterBaseStats(recLv);
  const hpMult=1+(diff-1)*0.35+(playerLevel*0.03);
  const defMult=1+(diff-1)*0.20;
  const dmgMult=1+(diff-1)*0.25+(playerLevel*0.02);
  return {hp:Math.floor(baseHp*hpMult), def:Math.floor(baseDef*defMult), dmg:Math.floor(baseDmg*dmgMult), baseHp,baseDef,baseDmg};
}
function scaleForDiff(min,max,diff){ const mult=1+(diff-1)*0.15; return {min:Math.floor(min*mult), max:Math.floor(max*mult)}; }
function playerStatsForLevel(L){ return {str:15+(L-1)*3, dex:10+Math.floor((L-1)*0.5), con:15+(L-1)*2, level:L}; }
function calcPlayerDmg(playerLevel, weaponMin, weaponMax, str, rwED, rwBMin, rwBMax){
  let wMin=weaponMin, wMax=weaponMax;
  wMin=Math.floor(wMin*(1+rwED/100))+rwBMin;
  wMax=Math.floor(wMax*(1+rwED/100))+rwBMax;
  const minDmg=5+wMin+Math.floor(str*1.5);
  const maxDmg=10+wMax+Math.floor(str*2.0);
  return {avg:Math.floor((minDmg+maxDmg)/2), minDmg, maxDmg};
}
// Pools
const currentWeaponPools={ act5_elite:{min:58,max:115,avg:86} };
const flatWeaponPools={ act5_elite:{min:22,max:42,avg:32} };
// Rift runeWords - here player will have Grief/Enigma etc
const rwRift={
  grief:{ed:0,bMin:240,bMax:360,name:"Grief"},
  botd:{ed:350,bMin:260,bMax:450,name:"BotD (VexHelElEldZodEth) 350%"},
  lastwish:{ed:280,bMin:180,bMax:320,name:"LastWish 280%"},
  griefNoRW:{ed:0,bMin:0,bMax:0,name:"엘리트 노말(룬워드 없음)"},
};
// Rift tiers: recLv = 80 + (tier-1)*2.5 ; riftHpScale = 1+tier*0.15+pow(tier/12,1.5) etc per dungeons.ts
function riftScaledStats(tier){
  const riftRecLv = 80 + Math.floor((tier-1)*2.5);
  const {baseHp,baseDef,baseDmg}=getMonsterBaseStats(riftRecLv);
  const riftHpScale=1+(tier*0.15)+Math.pow(tier/12,1.5);
  const riftDefScale=1+(tier*0.08);
  const riftDmgScale=1+(tier*0.12)+(tier*0.01);
  const endBaseHp=Math.floor(40+riftRecLv*7.5+Math.pow(riftRecLv/10,1.5)*10);
  const endBaseDef=Math.floor(4+riftRecLv*0.85);
  const endBaseDmg=Math.floor(5+riftRecLv*0.65);
  return {riftRecLv, baseHp:endBaseHp, baseDef:endBaseDef, baseDmg:endBaseDmg, riftHpScale, riftDefScale, riftDmgScale, rawBaseHp:baseHp};
}
function simulateRift(useFlat){
  const pool = useFlat? flatWeaponPools.act5_elite : currentWeaponPools.act5_elite;
  console.log("\n======== 대균열 RIFT (난이도=현재 maxUnlockDifficulty 개념, recLv 80~115, 몬스터는 RiftScale 추가) : "+(useFlat?"2안 FLAT":"CURRENT")+" ========");
  console.log("| RiftTier | recLv | 모드 | 난이도 | 무기(스케일) | 룬워드 | 평균딜 | riftHpScale | Rift몹HP | Rift몹Def | Slash딜 | Slash보스킬 | Exec보스킬 | 몬스터1타 | 생존 | 판정 |");
  for(const tier of [1,5,10,15,18,25,30]){
    const {riftRecLv, baseHp,endBaseDef,endBaseDmg,riftHpScale,riftDefScale,riftDmgScale}=riftScaledStats(tier);
    // Rift normal mob: endBaseHp * riftHpScale ; boss = baseHp*9.5 * riftHpScale (approx per createDungeonFormation)
    // Use diff = 5 as representative (player at Lv ~85-90)
    for(const diff of [1,5,10]){
      for(const [rwKey,rw] of Object.entries(rwRift)){
        if(rwKey==="griefNoRW" && tier>10) continue; // skip early RW for high tier
        if(rwKey!=="grief" && rwKey!=="griefNoRW") continue; // focus on Grief for ceiling; BotD/LastWish printed separately
        const playerLv = 85 + Math.floor(tier*0.3); // rift pushes level a bit
        const pStats=playerStatsForLevel(playerLv);
        const scaledW=scaleForDiff(pool.min,pool.max,diff);
        const pdmg=calcPlayerDmg(playerLv, scaledW.min, scaledW.max, pStats.str, rw.ed, rw.bMin, rw.bMax);
        const riftMobHp=Math.floor(baseHp*riftHpScale*(1+(diff-1)*0.35+playerLv*0.03));
        const riftMobDef=Math.floor(endBaseDef*riftDefScale*(1+(diff-1)*0.20));
        const riftBossHp=Math.floor(baseHp*9.5*riftHpScale*(1+(diff-1)*0.35+playerLv*0.03));
        const defMult=calculateDamageMultiplier(playerLv, riftMobDef);
        const slashDmg=Math.floor(pdmg.avg*1.2*defMult);
        const execDmg=Math.floor(pdmg.avg*4.2*defMult);
        // For rift, Execute extra-turn not counted, just raw hits
        const bossHitsSlash=Math.ceil(riftBossHp/Math.max(1,slashDmg));
        const bossHitsExec=Math.ceil(riftBossHp/Math.max(1,execDmg));
        // survivability
        const gearDef=450;
        const scaledDef=Math.floor(gearDef*(1+(diff-1)*0.15));
        const playerDef=Math.floor(pStats.con*1.5+scaledDef);
        const playerHp=120+(playerLv-1)*25+pStats.con*5;
        const baseRiftDmg=Math.floor(endBaseDmg*riftDmgScale);
        const scaledMonsterDmg=Math.floor(baseRiftDmg*(1+(diff-1)*0.25+playerLv*0.02));
        const mitigDmg=Math.max(1,Math.floor(scaledMonsterDmg*(100+playerLv*10)/(100+playerLv*10+playerDef)));
        const hitsToDie=Math.ceil(playerHp/mitigDmg);
        let verdict="";
        if(bossHitsSlash<=5) verdict="여유";
        else if(bossHitsSlash<=9) verdict="가능";
        else if(bossHitsSlash<=15) verdict="빡셈";
        else if(bossHitsExec<=10) verdict="Execute 필수";
        else verdict="불가";
        if(hitsToDie < bossHitsSlash && verdict!=="불가") verdict+="/생존주의";
        // only print tier 1,10,18,30 with diff 5 for brevity, plus diff sweep for tier10
        if( (tier===1||tier===10||tier===18||tier===25||tier===30) && diff===5 ){
          console.log("| "+tier+" | "+riftRecLv+" | "+rw.name+" | "+diff+" | "+pool.min+"~"+pool.max+"->"+scaledW.min+"~"+scaledW.max+" | "+pdmg.avg+" | "+riftHpScale.toFixed(2)+" | "+riftMobHp+" | "+riftMobDef+" | "+slashDmg+" | "+bossHitsSlash+"타 | "+bossHitsExec+"타 | "+mitigDmg+" ("+hitsToDie+"타) | "+verdict+" |");
        }
        if(tier===10 && rwKey==="grief"){
          // also print diff sweep for tier10
        }
      }
    }
  }
  // Detailed diff sweep for tier 10 Grief
  console.log("\n--- Tier10 Grief 난이도 스위프 (useFlat="+useFlat+") ---");
  {
    const tier=10;
    const {riftRecLv,baseHp,endBaseDef,endBaseDmg,riftHpScale,riftDefScale}=riftScaledStats(tier);
    const endBaseHp=Math.floor(40+riftRecLv*7.5+Math.pow(riftRecLv/10,1.5)*10);
    const rw=rwRift.grief;
    const pool2 = useFlat? flatWeaponPools.act5_elite : currentWeaponPools.act5_elite;
    for(const diff of [1,3,5,8,10,12,15]){
      const playerLv=88;
      const pStats=playerStatsForLevel(playerLv);
      const scaledW=scaleForDiff(pool2.min,pool2.max,diff);
      const pdmg=calcPlayerDmg(playerLv, scaledW.min, scaledW.max, pStats.str, rw.ed, rw.bMin, rw.bMax);
      const riftMobHp=Math.floor(baseHp*riftHpScale*(1+(diff-1)*0.35+playerLv*0.03));
      const riftMobDef=Math.floor(endBaseDef*riftDefScale*(1+(diff-1)*0.20));
      const riftBossHp=Math.floor(baseHp*9.5*riftHpScale*(1+(diff-1)*0.35+playerLv*0.03));
      const defMult=calculateDamageMultiplier(playerLv, riftMobDef);
      const slashDmg=Math.floor(pdmg.avg*1.2*defMult);
      const bossHitsSlash=Math.ceil(riftBossHp/Math.max(1,slashDmg));
      console.log("diff "+diff+": Slash "+slashDmg+" Boss "+bossHitsSlash+"타 (HP "+riftBossHp+" defMult "+(defMult*100).toFixed(1)+"%) riftScale "+riftHpScale.toFixed(2));
    }
  }
  // Compare Grief vs BotD vs LastWish at tier18
  console.log("\n--- Tier18 무기 비교 (useFlat="+useFlat+", diff5) ---");
  {
    const tier=18;
    const {riftRecLv,endBaseDef,riftHpScale}=riftScaledStats(tier);
    const endBaseHp=Math.floor(40+riftRecLv*7.5+Math.pow(riftRecLv/10,1.5)*10);
    const playerLv=90;
    const pStats=playerStatsForLevel(playerLv);
    const pool2 = useFlat? flatWeaponPools.act5_elite : currentWeaponPools.act5_elite;
    const riftBossHp=Math.floor(baseHp*9.5*riftHpScale*(1+4*0.35+playerLv*0.03));
    const riftMobDef=Math.floor(endBaseDef*1.8*(1+4*0.20)); // riftDefScale ~2.44? Actually 1+18*0.08=2.44
    const defMult=calculateDamageMultiplier(playerLv, riftMobDef);
    for(const [k,rw] of Object.entries(rwRift)){
      const scaledW=scaleForDiff(pool2.min,pool2.max,5);
      const pdmg=calcPlayerDmg(playerLv, scaledW.min, scaledW.max, pStats.str, rw.ed, rw.bMin, rw.bMax);
      const slashDmg=Math.floor(pdmg.avg*1.2*defMult);
      const bossHits=Math.ceil(riftBossHp/Math.max(1,slashDmg));
      console.log(k+" "+rw.name+" avg "+pdmg.avg+" slash "+slashDmg+" boss "+bossHits+"타");
    }
  }
}
simulateRift(false);
simulateRift(true);
console.log("\nDONE");
