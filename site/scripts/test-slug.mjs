// Verifies the shipped slugger reproduces every anchor on the live site.
import fs from 'node:fs'; import path from 'node:path';
import * as esbuild from 'esbuild';
const REF='/tmp/claude-1001/-home-ubuntu-doc/2c93b371-c73f-4152-a81d-392a543bb2ad/scratchpad/ref2/styles';
const root=new URL('../src/lib/',import.meta.url);
const bundle=await esbuild.build({
  entryPoints:[new URL('slugify.ts',root).pathname],
  bundle:true, write:false, format:'esm', target:'node22', platform:'node',
});
const mod=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const {Slugger}=mod;

let total=0, ok=0; const fails=[];
for(const f of fs.readdirSync(REF).filter(f=>f.endsWith('.json'))){
  const m=JSON.parse(fs.readFileSync(path.join(REF,f),'utf8')).__meta;
  if(!m?.headings?.length) continue;
  const sl=new Slugger();
  for(const h of m.headings){
    if(!h.id||/^_r_/.test(h.id)) continue;
    const got=sl.slug(JSON.parse(h.x)); total++;
    if(got===h.id) ok++; else fails.push({page:f,text:JSON.parse(h.x),want:h.id,got});
  }
}
console.log(`ANCHOR PARITY: ${ok}/${total}`);
for(const f of fails.slice(0,10)) console.log(`  [${f.page}] ${JSON.stringify(f.text)}\n    want ${f.want}\n    got  ${f.got}`);
process.exit(fails.length?1:0);
