import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const backend=path.resolve(process.argv[2] || '../Sigmawealthsolutionbackend');
const remote=execFileSync('git',['-C',backend,'config','--get','remote.origin.url'],{encoding:'utf8'}).trim();
if(remote!=='https://github.com/emmanuel582/Sigmawealthsolutionbackend.git')throw Error('Unexpected backend repository; nothing copied.');
for(const file of ['lib/sigma/fundingPlans.ts','lib/sigma/money.ts']) {
  const target=path.resolve(backend,file);
  if(!target.startsWith(backend+path.sep))throw Error('Unsafe target');
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(file,target);
}
console.log('Shared funding and currency contracts synchronized to the separate backend.');
