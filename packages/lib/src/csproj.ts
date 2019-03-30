import { readFileSync, writeFileSync } from 'fs';
import { IPackage } from './registry';

const RegExEscape = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

type PartialPackageInfo = Pick<IPackage, 'name' | 'version' | 'assemblyVersion'>;

export function updateProjectFile(filePath: string, packages: PartialPackageInfo[]) {
	const updatedFileContents = packages.reduce((acc: string, pkg) => {
		const updated = updatePackagesConfigStyleReferences(acc, pkg);
		return updatePackageReferenceStyleReferences(updated, pkg);
	}, readFileSync(filePath, 'utf-8'));

	writeFileSync(filePath, updatedFileContents, 'utf-8');
}

function updatePackagesConfigStyleReferences(file: string, pkg: PartialPackageInfo) {
	const { name, version, assemblyVersion } = pkg;

	const packageReferenceRegEx = new RegExp(
		`<Reference Include="${RegExEscape(name)},.*Version=(.*?),`
	);
	const referenceMatch = packageReferenceRegEx.exec(file);
	if (!referenceMatch || !referenceMatch[0] || !referenceMatch[1]) {
		return file;
	}

	const hintPathRegEx = new RegExp(`<HintPath>.*${RegExEscape(name)}\.(.*?)\\lib`);
	const hintPathMatch = hintPathRegEx.exec(file);
	if (!hintPathMatch || !hintPathMatch[0] || !hintPathMatch[1]) {
		return file;
	}

	const newReference = referenceMatch[0].replace(referenceMatch[1], assemblyVersion);
	const newHintPath = hintPathMatch[0].replace(
		hintPathMatch[1].replace('\\', '').replace('/', ''),
		version
	);

	return file.replace(referenceMatch[0], newReference).replace(hintPathMatch[0], newHintPath);
}

function updatePackageReferenceStyleReferences(file: string, pkg: PartialPackageInfo) {
	const { name, version } = pkg;

	const packageReferenceRegEx = new RegExp(
		`<PackageReference Include="${RegExEscape(name)}" *?>((.|\r|\n)*?)<\/PackageReference>`
	);
	const referenceMatch = packageReferenceRegEx.exec(file);
	if (!referenceMatch || !referenceMatch[0] || !referenceMatch[1]) {
		return file;
	}

	const versionRegEx = new RegExp(`<Version>(.*)?<\/Version>`);
	const versionMatch = versionRegEx.exec(referenceMatch[1]);
	if (!versionMatch || !versionMatch[0] || !versionMatch[1]) {
		return file;
	}

	const newReference = referenceMatch[0].replace(versionMatch[1], version);

	return file.replace(referenceMatch[0], newReference);
}
