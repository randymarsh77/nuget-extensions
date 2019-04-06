import * as vscode from 'vscode';
import {
	readRegistry,
	unregisterPackagesInDirectory,
	unregisterPackagesMatchingPattern,
	ILogger,
} from 'nuget-extensions-lib';
import { RegisterTargetKind } from './register-utility';

interface IUnregisterTarget {
	kind: RegisterTargetKind;
	value: string;
}

export async function executeUnregisterCommand(logger: ILogger) {
	const target = await pickTarget();
	if (target && target.kind === RegisterTargetKind.Directory) {
		unregisterPackagesInDirectory(target.value, { logger });
		vscode.window.showInformationMessage(`Unregistered all packages in ${target.value}`);
	} else if (target && target.kind === RegisterTargetKind.Package) {
		unregisterPackagesMatchingPattern(target.value, { logger });
		vscode.window.showInformationMessage(`Unregistered all packages matching ${target.value}`);
	}
}

async function pickTarget(): Promise<IUnregisterTarget | undefined> {
	const targets = findTargets();
	let options: vscode.QuickPickOptions = {
		ignoreFocusOut: true,
		matchOnDescription: true,
		matchOnDetail: true,
		placeHolder: 'Select a package or directory to unregister',
	};

	const choice = await vscode.window.showQuickPick(targets.map(x => x.value), options);
	return (choice && targets.filter(x => x.value === choice)[0]) || undefined;
}

function findTargets(): IUnregisterTarget[] {
	const registry = readRegistry();
	const [prefixMatches, directories] = Object.keys(registry).reduce(
		(acc, v) => {
			const [prefixMatches, directories] = acc;
			const { directory, name } = registry[v];
			directories.add(directory);
			name.split('.').reduce((prefix, segment) => {
				const next = `${prefix}${prefix.length !== 0 ? '.' : ''}${segment}`;
				prefixMatches.add(next === name ? name : `${next}.*`);
				return next;
			}, '');
			return acc;
		},
		[new Set<string>(), new Set<string>()]
	);
	return [
		...[...directories.values()].map(value => ({ kind: RegisterTargetKind.Directory, value })),
		...[...prefixMatches.values()].map(value => ({ kind: RegisterTargetKind.Package, value })),
	];
}
