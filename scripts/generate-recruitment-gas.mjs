import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as contract from '../server/recruitment-contract.mjs';
const output = new URL('../artifacts/recruitment-gas/', import.meta.url);
await mkdir(output, { recursive: true });
const declarations = [
  'TEXT_FIELDS',
  'REQUIRED_TEXT',
  'CHOICES',
  'MULTI_FIELDS',
  'REQUIRED_CHOICES',
  'APPLICATION_FIELDS',
  'DOMAINS',
]
  .map((key) => `const ${key} = ${JSON.stringify(contract[key], null, 2)};`)
  .join('\n');
const source = await readFile(
  new URL('../recruitment/gas/intake.js', import.meta.url),
  'utf8',
);
await writeFile(
  new URL('Code.gs', output),
  declarations + '\n' + contract.validateApplication.toString() + '\n' + source,
);
await writeFile(
  new URL('appsscript.json', output),
  JSON.stringify(
    {
      timeZone: 'Asia/Jakarta',
      runtimeVersion: 'V8',
      exceptionLogging: 'NONE',
      oauthScopes: ['https://www.googleapis.com/auth/spreadsheets'],
    },
    null,
    2,
  ) + '\n',
);
console.log(
  'Recruitment GAS generated in artifacts/recruitment-gas/; no secrets or applicant records.',
);
