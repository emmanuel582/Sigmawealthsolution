import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const html=await fs.readFile('.next/server/app/index.html','utf8');
const section=html.match(/<section id="funding-plans"[\s\S]*?<\/section>/)?.[0];
assert.ok(section,'funding section exists in the actual production render');
assert.equal((section.match(/<article/g)||[]).length,5);
for(const amount of ['64,000','98,550','135,000','540,000','2,160,000'])assert.ok(section.includes(amount),amount);
assert.ok(!section.includes('type="number"'),'no editable amount field');
console.log('Production landing page renders exactly five funding cards and all requested amounts.');
