import * as path from 'path';
import * as vscode from 'vscode';

export enum LinkTargetKind {
	Solution,
	Project,
}

export interface LinkTarget {
	label: string;
	description: string;
	directory: string;
	target: string;
	kind: LinkTargetKind;
}

export async function findLinkTargets(): Promise<LinkTarget[]> {
	if (!vscode.workspace.workspaceFolders) {
		return Promise.resolve([]);
	}

	const projectFiles = await vscode.workspace.findFiles(
		/*include*/ '{**/*.sln,**/*.csproj}',
		/*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}',
		/*maxResults*/ 1000
	);

	return resourcesToLinkTargets(projectFiles);
}

function resourcesToLinkTargets(resources: vscode.Uri[]): LinkTarget[] {
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

	let targets: LinkTarget[] = [];

	workspaceFolderToUriMap.forEach(resources => {
		resources.forEach(resource => {
			const solution = isSolution(resource);
			const csproj = isCSharpProject(resource);
			if (solution || csproj) {
				targets.push({
					label: path.basename(resource.fsPath),
					description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
					target: resource.fsPath,
					directory: path.dirname(resource.fsPath),
					kind: solution ? LinkTargetKind.Solution : LinkTargetKind.Project,
				});
			}
		});
	});

	return targets.sort((a, b) => a.directory.localeCompare(b.directory));
}

function isCSharpProject(resource: vscode.Uri): boolean {
	return /\.csproj$/i.test(resource.fsPath);
}

function isSolution(resource: vscode.Uri): boolean {
	return /\.sln$/i.test(resource.fsPath);
}
