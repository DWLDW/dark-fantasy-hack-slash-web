import fs from "fs";
let s = fs.readFileSync("C:/game/src/data/items.ts","utf8");
const tags={
  'e_short_sword_2s': ['sword','melee'],
  'e_scimitar_2s': ['sword','melee'],
  'e_broad_sword_4s': ['sword','melee'],
  'e_crystal_sword_4s': ['sword','melee'],
  'e_flail_4s': ['mace','melee'],
  'e_zweihander_5s': ['sword','melee'],
  'e_thresher_4s': ['polearm','melee'],
  'e_phase_blade_5s': ['sword','melee'],
  'e_colossus_blade_6s': ['sword','melee'],
  'e_gull_dagger': ['sword','melee'],
  'e_broad_sword_3s': ['sword','melee'],
  'e_phase_blade_3s': ['sword','melee'],
  'e_phase_blade_4s': ['sword','melee'],
  'e_phase_blade_6s': ['sword','melee'],
  'e_berserker_axe_4s': ['axe','melee'],
  'e_berserker_axe_5s': ['axe','melee'],
  'e_berserker_axe_6s': ['axe','melee'],
  'e_colossus_blade_5s': ['sword','melee'],
  'u_butchers_pupil': ['axe','melee'],
  'u_ali_baba': ['sword','melee'],
  'u_wizardspike': ['sword','melee'],
  'u_lightsabre': ['sword','melee'],
  'u_grandfather': ['sword','melee'],
  'u_windforce': ['bow','missile'],
};
let tagged=0;
for(const [id,arr] of Object.entries(tags)){
  const grp=arr[0], sup=arr[1];
  const needle="id: \'"+id+"\'";
  const idx=s.indexOf(needle);
  if(idx<0) continue;
  const slice=s.slice(idx, idx+2500);
  if(slice.includes("weaponGroup")) continue;
  const idenPos=s.indexOf("isIdentified", idx);
  if(idenPos<0 || idenPos>idx+2200) continue;
  const commaAfter=s.indexOf(",", idenPos);
  const insert="\n    weaponGroup: \'"+grp+"\',\n    weaponSuperGroup: \'"+sup+"\',";
  s=s.slice(0, commaAfter+1)+insert+s.slice(commaAfter+1);
  tagged++;
}
console.log("tagged", tagged);
const flatScales={
  'e_short_sword_2s': [1.35,1.35],
  'e_scimitar_2s': [1.35,1.35],
  'e_broad_sword_4s': [1.35,1.35],
  'e_crystal_sword_4s': [1.35,1.35],
  'e_flail_4s': [1.35,1.35],
  'e_broad_sword_3s': [1.35,1.35],
  'e_zweihander_5s': [0.88,0.88],
  'e_thresher_4s': [0.78,0.78],
  'e_phase_blade_5s': [0.78,0.78],
  'e_colossus_blade_6s': [0.78,0.78],
  'e_phase_blade_3s': [0.78,0.78],
  'e_phase_blade_4s': [0.78,0.78],
  'e_phase_blade_6s': [0.78,0.78],
  'e_berserker_axe_4s': [0.78,0.78],
  'e_berserker_axe_5s': [0.78,0.78],
  'e_berserker_axe_6s': [0.78,0.78],
  'e_colossus_blade_5s': [0.78,0.78],
  'u_butchers_pupil': [0.88,0.88],
  'u_ali_baba': [0.88,0.88],
  'u_grandfather': [0.78,0.78],
  'u_windforce': [0.78,0.78],
  'u_lightsabre': [0.78,0.78],
  'u_wizardspike': [0.78,0.78],
  'e_gull_dagger': [1.35,1.35],
};
let flatCount=0;
for(const [id,scales] of Object.entries(flatScales)){
  const sMin=scales[0], sMax=scales[1];
  const needle="id: \'"+id+"\'";
  let idx=s.indexOf(needle);
  if(idx<0) continue;
  const blockStart=s.indexOf("stats: {", idx);
  if(blockStart<0 || blockStart>idx+2000) continue;
  const blockEnd=s.indexOf("}", blockStart);
  let block=s.slice(blockStart, blockEnd+1);
  const minM=block.match(/minDmg: (\d+)/);
  const maxM=block.match(/maxDmg: (\d+)/);
  if(!minM || !maxM) continue;
  const oldMin=parseInt(minM[1],10), oldMax=parseInt(maxM[1],10);
  const newMin=Math.max(1, Math.round(oldMin*sMin));
  const newMax=Math.max(newMin+1, Math.round(oldMax*sMax));
  const before=s.slice(0, blockStart);
  const after=s.slice(blockEnd+1);
  block=block.replace("minDmg: "+oldMin, "minDmg: "+newMin).replace("maxDmg: "+oldMax, "maxDmg: "+newMax);
  s=before+block+after;
  flatCount++;
}
console.log("flattened", flatCount);
fs.writeFileSync("C:/game/src/data/items.ts", s, "utf8");
console.log("written", s.length);
