import type {Claim,Evidence} from './contracts';

// Grammar, modality and relationship words do not describe physical mechanisms.
// Everything else must be grounded in the cited passages. This deliberately
// prefers rejection to guessing whether an unfamiliar technical term is a synonym.
const stem=(word:string)=>word.toLowerCase().replace(/(?:ies|ied)$/,'y').replace(/(?:ing|ed|s)$/,'').replace(/(.)\1$/,'$1');
const grammar=new Set(('a an the and or but of in on at to for from with as that which it its is are was were be been being has have had this these those by also source sources record records history states says shows noted notes including includes include '+
'may might could can would should suggest suggests suggests suggesting indicate indicates indicating contribute contributes contributing contributor contributors consequence risk risks relationship association associated consistent possible possibly plausible potentially potential given because due during after before over across between within without both either neither such related relevant available supplied evidence established establish confirmed confirm documented prove proven not no never cannot unknown unclear uncertain uncertainty requires require needs need investigation investigate investigate inspection inspect underlying further whether determining determine assess assessment evaluated evaluate review review recommended recommendation recommendations recommended chronological dated date dates event events entry entries prior previous later earlier latest first second subsequent listed recorded reported described found observed attention focused focus recurring recur recurrent repeatedly repeated recurrence routine condition conditions mechanism mechanisms defect defects side factor factors pattern patterns present presence existing operational work order orders task tasks action actions completed complete performed noted report cite citation warn against').split(/\s+/).map(stem));
const terms=(text:string)=>(text.normalize('NFC').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]).map(stem).filter(t=>!grammar.has(t));

export function atomicPropositions(text:string):string[]{
 const sentences=text.split(/(?<=[.!?;])\s+|;\s*/).filter(Boolean);
 return sentences.flatMap(sentence=>{
  // Coordinated subjects sharing a predicate: "X or Y may contribute ...".
  const subject=sentence.match(/^(.+?)\s+((?:may|might|could|is|are|was|were)\b.*)$/i);
  if(subject&&/\s+(?:and|or)\s+/i.test(subject[1]))return subject[1].split(/\s+(?:and|or)\s+/i).map(part=>part+' '+subject[2]);
  // Explicit clauses each carrying their own predicate, preserving their wording.
  return sentence.split(/,?\s+(?:and|but|or)\s+(?=[A-Z][\w -]{0,70}\s+(?:may|might|could|is|are|was|were|has|have)\b)/);
 });
}
function investigationOnly(text:string){
 // The whole assertion must disclaim the condition; an appended "investigate"
 // cannot excuse a positive assertion made earlier in the proposition.
 return /^whether\b.+\b(?:is unknown|is not established|requires? (?:inspection|investigation|evidence))\W*$/i.test(text.trim()) ||
  /^[^.;!?]+\b(?:is|are|was|were) not (?:established|confirmed|documented|shown)\b[^.;!?]*\b(?:requires?|needs?) (?:inspection|investigation|evidence)\W*$/i.test(text.trim());
}
export function mechanismCheck(claim:Claim,evidence:Evidence[]){
 const vocabulary=new Set(evidence.filter(e=>claim.citations.includes(e.id)).flatMap(e=>terms(e.text)));
 return atomicPropositions(claim.text).map(text=>({text,missing_terms:investigationOnly(text)?[]:[...new Set(terms(text).filter(t=>!vocabulary.has(t)))]}));
}
export function mechanismReason(claim:Claim,evidence:Evidence[]):string|null {
 return mechanismCheck(claim,evidence).some(p=>p.missing_terms.length)?'new evidence-absent concept or mechanism':null;
}
