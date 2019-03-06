import { readFileSync, writeFileSync } from 'fs';
import { IPackage } from './registry';

const RegExEscape = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

type PartialPackageInfo = Pick<IPackage, 'name' | 'version' | 'assemblyVersion'>;

export function updateProjectFile(file: string, packages: PartialPackageInfo[]) {
	const project = packages.reduce((acc: string, pkg) => {
		const { name, version, assemblyVersion } = pkg;

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
}
