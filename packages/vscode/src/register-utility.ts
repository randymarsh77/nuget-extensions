import * as path from 'path';
import * as vscode from 'vscode';

export enum RegisterTargetKind {
	Package,
	Directory,
}

export interface RegisterTarget {
	label: string;
	description: string;
	directory: string;
	target: string;
	kind: RegisterTargetKind;
}

export async function findRegisterTargets(): Promise<RegisterTarget[]> {
	if (!vscode.workspace.workspaceFolders) {
		return Promise.resolve([]);
	}

	const packageFiles = await vscode.workspace.findFiles(
		/*include*/ '{**/*.nupkg}',
		/*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}',
		/*maxResults*/ 1000
	);

	return resourcesToRegisterTargets(packageFiles);
}

function resourcesToRegisterTargets(resources: vscode.Uri[]): RegisterTarget[] {
	if (!Array.isArray(resources)) {
		return [];
	}

	let workspaceFolderToUriMap = new Map<number, vscode.Uri[]>();

	for (let resource of resources) {
		let folder = vscode.workspace.getWorkspaceFolder(resource);
		if (folder) {
			let buckets: vscode.Uri[];

			if (workspaceFolderToUriMap.has(folder.index)) {
				buckets = workspaceFolderToUriMap.get(folder.index) || [];
			} else {
				buckets = [];
				workspaceFolderToUriMap.set(folder.index, buckets);
			}

			buckets.push(resource);
		}
	}

	let targets: RegisterTarget[] = [];
	const directories = new Set<string>();

	workspaceFolderToUriMap.forEach(resources => {
		resources.forEach(resource => {
			const directory = path.dirname(resource.fsPath);

			if (!directories.has(directory)) {
				directories.add(directory);
				targets.push({
					label: directory,
					description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
					target: resource.fsPath,
					directory: path.dirname(resource.fsPath),
					kind: RegisterTargetKind.Directory,
				});
			}

			targets.push({
				label: path.basename(resource.fsPath),
				description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
				target: resource.fsPath,
				directory: path.dirname(resource.fsPath),
				kind: RegisterTargetKind.Package,
			});
		});
	});

	return targets.sort((a, b) => a.directory.localeCompare(b.directory));
}
