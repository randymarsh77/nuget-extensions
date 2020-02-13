const fs = require('fs');
const path = require('path');

const azureKey = process.env.AZURE_KEY;
if (!azureKey) {
	throw new Error('$AZURE_KEY not specified');
}

const { name, version } = require(path.join(__dirname, '..', 'package.json'));
const telemetryPath = path.join(__dirname, '..', 'src', 'telemetry.ts');

const original = `${fs.readFileSync(telemetryPath)}`;
const updated = [updateId, updateAzureKey, updateAppVersion].reduce(
	(data, func) => func(data),
	original
);
fs.writeFileSync(telemetryPath, updated);

function updateAzureKey(original) {
	const toReplace = `export const telemetryKey = '';`;
	const replaceWith = toReplace.replace(`''`, `'${azureKey}'`);
	return original.replace(toReplace, replaceWith);
}

function updateId(original) {
	const toReplace = `export const telemetryId = '';`;
	const replaceWith = toReplace.replace(`''`, `'${name}'`);
	return original.replace(toReplace, replaceWith);
}

function updateAppVersion(original) {
	const toReplace = `export const telemetryAppVersion = '';`;
	const replaceWith = toReplace.replace(`''`, `'${version}'`);
	return original.replace(toReplace, replaceWith);
}
