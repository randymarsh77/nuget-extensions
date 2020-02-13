const fs = require('fs');
const path = require('path');

const azureKey = process.env.AZURE_KEY;
if (!azureKey) {
	throw new Error('$AZURE_KEY not specified');
}

const keysPath = path.join(__dirname, '..', 'src', 'keys.ts');

const toReplace = `export const telemetryKey = '';`;
const replaceWith = toReplace.replace(`''`, `'${azureKey}'`);

const original = `${fs.readFileSync(keysPath)}`;
const updated = original.replace(toReplace, replaceWith);
fs.writeFileSync(keysPath, updated);
