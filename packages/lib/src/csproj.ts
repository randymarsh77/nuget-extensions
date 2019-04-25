import { readFileSync, writeFileSync } from 'fs';
import { IPackage } from './registry';

const RegExEscape = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

export type PartialPackageInfo = Pick<IPackage, 'name' | 'version' | 'assemblyVersion'>;

type PackageVersionData = Pick<IPackage, 'version' | 'assemblyVersion'>;

export enum ReferenceType {
	PackagesConfig,
	PackageReference,
}

export interface IProjectFileChange {
	name: string;
	type: ReferenceType;
	previous: PackageVersionData;
	updated: PackageVersionData;
}

export function updateProjectFile(
	filePath: string,
	packages: PartialPackageInfo[]
): IProjectFileChange[] {
	const { fileContents, changes } = packages.reduce(
		({ fileContents, changes }, pkg) => {
			const result =
				updatePackagesConfigStyleReferences(fileContents, pkg) ||
				updatePackageReferenceStyleReferences(fileContents, pkg);
			return {
				fileContents: (result && result.updated) || fileContents,
				changes: (result && [...changes, result.change]) || changes,
			};
		},
		{ fileContents: readFileSync(filePath, 'utf-8'), changes: [] as IProjectFileChange[] }
	);

	writeFileSync(filePath, fileContents, 'utf-8');

	return changes;
}

function updatePackagesConfigStyleReferences(
	file: string,
	pkg: PartialPackageInfo
): { updated: string; change: IProjectFileChange } | null {
	const { name, version, assemblyVersion } = pkg;

	const packageReferenceRegEx = new RegExp(
		`<Reference Include="${RegExEscape(name)},.*Version=(.*?),`
	);
	const referenceMatch = packageReferenceRegEx.exec(file);
	if (!referenceMatch || !referenceMatch[0] || !referenceMatch[1]) {
		return null;
	}

	const hintPathRegEx = new RegExp(`<HintPath>.*${RegExEscape(name)}\.(.*?)\\lib`);
	const hintPathMatch = hintPathRegEx.exec(file);
	if (!hintPathMatch || !hintPathMatch[0] || !hintPathMatch[1]) {
		return null;
	}

	const newReference = referenceMatch[0].replace(referenceMatch[1], assemblyVersion);
	const hintPathVersion = hintPathMatch[1].replace('\\', '').replace('/', '');
	const newHintPath = hintPathMatch[0].replace(hintPathVersion, version);

	return {
		updated: file.replace(referenceMatch[0], newReference).replace(hintPathMatch[0], newHintPath),
		change: {
			name,
			type: ReferenceType.PackageReference,
			previous: { version: hintPathVersion, assemblyVersion: referenceMatch[1] },
			updated: { version, assemblyVersion },
		},
	};
}

function updatePackageReferenceStyleReferences(
	file: string,
	pkg: PartialPackageInfo
): { updated: string; change: IProjectFileChange } | null {
	const { name, version } = pkg;

	const packageReferenceRegEx = new RegExp(
		`<PackageReference Include="${RegExEscape(name)}" *?>((.|\r|\n)*?)<\/PackageReference>`
	);
	const referenceMatch = packageReferenceRegEx.exec(file);
	if (!referenceMatch || !referenceMatch[0] || !referenceMatch[1]) {
		return null;
	}

	const versionRegEx = new RegExp(`<Version>(.*)?<\/Version>`);
	const versionMatch = versionRegEx.exec(referenceMatch[1]);
	if (!versionMatch || !versionMatch[0] || !versionMatch[1]) {
		return null;
	}

	const newReference = referenceMatch[0].replace(versionMatch[1], version);

	return {
		updated: file.replace(referenceMatch[0], newReference),
		change: {
			name,
			type: ReferenceType.PackageReference,
			previous: { version: versionMatch[1], assemblyVersion: '' },
			updated: { version, assemblyVersion: '' },
		},
	};
}
