const { readFileSync, writeFileSync } = require('fs');

RegExEscape = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

module.exports = {
	updateProjectFile: (file, packages) => {
		const project = packages.reduce((acc, package) => {
			const { name, version, assemblyVersion } = package;

			const packageReferenceRegEx = new RegExp(
				`<Reference Include="${RegExEscape(name)},.*Version=(.*?),`
			);
			const referenceMatch = packageReferenceRegEx.exec(acc);
			if (!referenceMatch || !referenceMatch[0] || !referenceMatch[1]) {
				return acc;
			}

			const hintPathRegEx = new RegExp(`<HintPath>.*${RegExEscape(name)}\.(.*?)\\lib`);
			const hintPathMatch = hintPathRegEx.exec(acc);
			if (!hintPathMatch || !hintPathMatch[0] || !hintPathMatch[1]) {
				return acc;
			}

			const newReference = referenceMatch[0].replace(referenceMatch[1], assemblyVersion);
			const newHintPath = hintPathMatch[0].replace(
				hintPathMatch[1].replace('\\', '').replace('/', ''),
				version
			);

			return acc.replace(referenceMatch[0], newReference).replace(hintPathMatch[0], newHintPath);
		}, readFileSync(file, 'utf-8'));

		writeFileSync(file, project, 'utf-8');
	},
};
