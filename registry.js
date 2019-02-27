const home = require('user-home');
const fs = require('fs');
const path = require('path');

const nugexDataDir = path.join(home, '.nugex');
const registryPath = path.join(nugexDataDir, 'registry.json');

const readRegistry = () => {
	if (!fs.existsSync(registryPath)) {
		return {};
	}
	const data = fs.readFileSync(registryPath);
	return JSON.parse(data || {});
};

const writeRegistry = registry => {
	if (!fs.existsSync(nugexDataDir)) {
		fs.mkdirSync(nugexDataDir);
	}
	fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
};

const parsePackage = package => {
	const parts = package.split('.');
	if (parts.length < 5) {
		return null;
	}
	const count = parts.length;
	const name = parts.slice(0, count - 4).join('.');
	const version = parts.slice(count - 4, count - 1).join('.');
	const extension = parts[count - 1];
	return {
		name,
		version,
		extension,
	};
};

module.exports = {
	readRegistry,
	writeRegistry,
	registerPackages: directory => {
		const registry = fs
			.readdirSync(directory)
			.filter(x => x.endsWith('.nupkg'))
			.reduce((acc, v) => {
				const parsed = parsePackage(v);
				if (!parsed) {
					return acc;
				}

				if (acc[v]) {
					console.log(`Registry entry exists for ${v}... skipping.`);
				} else {
					console.log(`Registering ${v}.`);
					const { name, version, extension } = parsed;
					acc[v] = {
						name,
						version,
						assemblyVersion: '0.0.0.0', // TODO: Don't assume/force
						extension,
						directory,
					};
				}
				return acc;
			}, readRegistry());
		writeRegistry(registry);
		console.log('Success!');
	},
};
