// CLEAN RIFT SIM: fix variable names consistently
function calculateDamageMultiplier(attackerLevel, targetDefense){ const K=100+attackerLevel*10; return Math.max(0.05, Math.min(1.0, K/(K+Math.max(0,targetDefense)))); }
function getMonsterBaseStats(recLv){ const baseHp=recLv<=10?Math.floor(18+recLv*6):Math.floor(40+recLv*7.5+Math.pow(recLv/10,1.5)*10); const baseDef=recLv<=10?Math.max(0,Math.floor((recLv-1)*1.1)):Math.floor(4+recLv*0.85); const baseDmg=recLv<=10?Math.max(2,Math.floor(2+recLv*0.45)):Math.floor(5+recLv*0.65); return {baseHp,baseDef,baseDmg}; }
function scaleForDiff(min,max,diff){ const mult=1+(diff-1)*0.15; return {min:Math.floor(min*mult), max:Math.floor(max*mult)}; }
function playerStatsForLevel(L){ return {str:15+(L-1)*3, con:15+(L-1)*2, level:L}; }
function calcPlayerDmg(playerLevel, weaponMin, weaponMax, str, rwED, rwBMin, rwBMax){ let wMin=Math.floor(weaponMin*(1+rwED/100))+rwBMin; let wMax=Math.floor(weaponMax*(1+rwED/100))+rwBMax; const minDmg=5+wMin+Math.floor(str*1.5); const maxDmg=10+wMax+Math.floor(str*2.0); return {avg:Math.floor((minDmg+maxDmg)/2)}; }
const currentP={min:58,max:115}, flatP={min:22,max:42};
const rws={ grief:{ed:0,bMin:240,bMax:360}, botd:{ed:350,bMin:260,bMax:450}, lastwish:{ed:280,bMin:180,bMax:320}, none:{ed:0,bMin:0,bMax:0} };
function riftStats(tier){ const riftRecLv=80+Math.floor((tier-1)*2.5); const hScale=1+(tier*0.15)+Math.pow(tier/12,1.5), dScale=1+(tier*0.08); const endBaseHp=Math.floor(40+riftRecLv*7.5+Math.pow(riftRecLv/10,1.5)*10); const endBaseDef=Math.floor(4+riftRecLv*0.85); return {riftRecLv, hScale, dScale, endBaseHp, endBaseDef}; }
function sim(useFlat){
  const pool=useFlat?flatP:currentP;
  console.log("\\n======== RIFT "+(useFlat?"2안 FLAT":"CURRENT")+" ========");
  console.log("| Tier | recLv | 룬워드 | 난이도 | 무기스케일 | 평균딜 | hScale | Rift몹HP | RiftDef | Slash딜 | Slash보스킬 | Exec보스킬 | 판정 |");
  for(const tier of [1,5,10,15,18,25,30]){
    const {riftRecLv,hScale,dScale,endBaseHp,endBaseDef}=riftStats(tier);
    for(const diff of [5]){
      for(const [k,rw] of Object.entries({grief:rws.grief,none:rws.none})){
        if(k==="none" && tier>10) continue;
        const playerLv=85+Math.floor(tier*0.3), p=playerStatsForLevel(playerLv);
        const sW=scaleForDiff(pool.min,pool.max,diff), pd=calcPlayerDmg(playerLv,sW.min,sW.max,p.str,rw.ed,rw.bMin,rw.bMax);
        const riftMobHp=Math.floor(endBaseHp*hScale*(1+(diff-1)*0.35+playerLv*0.03));
        const riftDef=Math.floor(endBaseDef*dScale*(1+(diff-1)*0.20));
        const riftBossHp=Math.floor(endBaseHp*9.5*hScale*(1+(diff-1)*0.35+playerLv*0.03));
        const defMult=calculateDamageMultiplier(playerLv,riftDef);
        const slash=Math.floor(pd.avg*1.2*defMult), exec=Math.floor(pd.avg*4.2*defMult);
        const bhSlash=Math.ceil(riftBossHp/Math.max(1,slash)), bhExec=Math.ceil(riftBossHp/Math.max(1,exec));
        let v=bhSlash<=5?"여유":bhSlash<=9?"가능":bhSlash<=15?"빡셈":bhExec<=10?"Exec 필수":"불가";
        console.log("| "+tier+" | "+riftRecLv+" | "+(k==="grief"?"Grief":"노말")+" | "+diff+" | "+pool.min+"~"+pool.max+"->"+sW.min+"~"+sW.max+" | "+pd.avg+" | "+hScale.toFixed(2)+" | "+riftMobHp+" | "+riftDef+" | "+slash+" | "+bhSlash+"타 | "+bhExec+"타 | "+v+" |");
      }
    }
  }
  console.log("\\n--- Tier10 Grief 난이도 스위프 (useFlat="+useFlat+") ---");
  {
    const tier=10, {riftRecLv,hScale,dScale,endBaseHp,endBaseDef}=riftStats(tier);
    for(const diff of [1,3,5,8,10,12,15]){
      const playerLv=88, p=playerStatsForLevel(playerLv), sW=scaleForDiff(pool.min,pool.max,diff), pd=calcPlayerDmg(playerLv,sW.min,sW.max,p.str,rws.grief.ed,rws.grief.bMin,rws.grief.bMax);
      const riftDef=Math.floor(endBaseDef*dScale*(1+(diff-1)*0.20)), riftBossHp=Math.floor(endBaseHp*9.5*hScale*(1+(diff-1)*0.35+playerLv*0.03));
      const defMult=calculateDamageMultiplier(playerLv,riftDef), slash=Math.floor(pd.avg*1.2*defMult);
      console.log("diff "+diff+": Slash "+slash+" Boss "+Math.ceil(riftBossHp/Math.max(1,slash))+"타 (HP "+riftBossHp+", def "+riftDef+", mult "+(defMult*100).toFixed(1)+"%)");
    }
  }
  console.log("\\n--- Tier18 diff5 무기 비교 (useFlat="+useFlat+") ---");
  {
    const tier=18,{riftRecLv,hScale,dScale,endBaseHp,endBaseDef}=riftStats(tier);
    const playerLv=90,p=playerStatsForLevel(playerLv);
    const riftDef=Math.floor(endBaseDef*dScale*(1+4*0.20)), riftBossHp=Math.floor(endBaseHp*9.5*hScale*(1+4*0.35+playerLv*0.03));
    const defMult=calculateDamageMultiplier(playerLv,riftDef);
    for(const [k,rw] of Object.entries(rws)){
      const sW=scaleForDiff(pool.min,pool.max,5), pd=calcPlayerDmg(playerLv,sW.min,sW.max,p.str,rw.ed,rw.bMin,rw.bMax);
      const slash=Math.floor(pd.avg*1.2*defMult);
      console.log(k.padEnd(10)+" "+slash+"딜 Boss "+Math.ceil(riftBossHp/Math.max(1,slash))+"타 avg"+pd.avg);
    }
  }
}
sim(false); sim(true); console.log("\\nDONE");
