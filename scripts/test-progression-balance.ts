import { calculateMaxExp } from '../src/state/helpers/saveManager';
import { ALL_AVAILABLE_SKILLS } from '../src/data/skills';
import { WARRIOR_PASSIVE_SKILLS } from '../src/data/passiveSkills';

console.log('📈 [Dark Fantasy Leveling & Progression Simulation]');
console.log('----------------------------------------------------');

const testLevels = [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 99];

let cumulativeExp = 0;
testLevels.forEach(lv => {
  const reqExp = calculateMaxExp(lv);
  cumulativeExp += reqExp;
  
  const unlockedSkills = ALL_AVAILABLE_SKILLS.filter(s => s.unlockLevel === lv).map(s => `[액티브: ${s.name}]`);
  const unlockedPassives = WARRIOR_PASSIVE_SKILLS.filter(p => p.unlockLevel === lv).map(p => `[패시브: ${p.name}]`);
  const unlocks = [...unlockedSkills, ...unlockedPassives].join(', ');

  console.log(`Lv.${String(lv).padStart(2, ' ')} | 필요 EXP: ${reqExp.toLocaleString().padStart(9, ' ')} | 누적 EXP: ${cumulativeExp.toLocaleString().padStart(11, ' ')} ${unlocks ? '✨ ' + unlocks : ''}`);
});

console.log('\n🎯 [Skill & Passive Max Level Inspection]');
console.log(`- Active Skills (${ALL_AVAILABLE_SKILLS.length}종) Max Levels: ${ALL_AVAILABLE_SKILLS.map(s => `${s.name.split(' ')[0]}(${s.maxLevel})`).join(', ')}`);
console.log(`- Passive Skills (${WARRIOR_PASSIVE_SKILLS.length}종) Max Levels: ${WARRIOR_PASSIVE_SKILLS.map(p => `${p.name.split(' ')[0]}(${p.maxLevel})`).join(', ')}`);

console.log('\n✅ [Simulation Complete]');
