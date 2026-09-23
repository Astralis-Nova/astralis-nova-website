export const MISSIONS=Object.freeze([
  Object.freeze({name:'Nebula Spear',moves:Object.freeze(['e4','e5','Nf3','Nc6'])}),
  Object.freeze({name:'Orion Gate',moves:Object.freeze(['d4','d5','c4','e6'])}),
  Object.freeze({name:'Andromeda Current',moves:Object.freeze(['c4','e5','Nc3','Nf6'])}),
  Object.freeze({name:'Cygnus Shield',moves:Object.freeze(['Nf3','d5','g3','Nf6'])}),
  Object.freeze({name:'Solar Flank',moves:Object.freeze(['g3','d5','Bg2','e5'])}),
  Object.freeze({name:'Pioneer Wing',moves:Object.freeze(['b3','e5','Bb2','Nc6'])}),
  Object.freeze({name:'Scorpius Probe',moves:Object.freeze(['c3','d5','d4','Nf6'])}),
  Object.freeze({name:'Lunar Passage',moves:Object.freeze(['e4','c5','Nf3','Nc6'])}),
  Object.freeze({name:'Vega Formation',moves:Object.freeze(['d4','Nf6','Nf3','g6'])}),
  Object.freeze({name:'Phoenix Net',moves:Object.freeze(['e4','e6','d4','d5'])})
]);

export function chooseMission(random=Math.random,previousName=''){
  const choices=MISSIONS.filter(mission=>mission.name!==previousName);
  const roll=Number(random());
  const normalized=Number.isFinite(roll)?Math.min(Math.max(roll,0),.999999999):0;
  return choices[Math.floor(normalized*choices.length)];
}
