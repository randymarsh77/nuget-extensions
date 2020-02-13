const fs = require('fs');
const path = require('path');

const version = require(path.join(__dirname, '..', 'package.json')).version;
const readmePath = path.join(__dirname, '..', 'README.md');

const toReplace = `### vNext`;
const replaceWith = toReplace.replace(`vNext`, `${version}`);

const original = `${fs.readFileSync(readmePath)}`;
const updated = original.replace(toReplace, replaceWith);
fs.writeFileSync(readmePath, updated);
