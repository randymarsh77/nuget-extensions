import * as vscode from 'vscode';
import { link, ILogger } from 'nuget-extensions-lib';
import { findLinkTargets, LinkTarget, LinkTargetKind } from './link-utility';

export async function executeLinkCommand(logger: ILogger) {
	const target = await pickLinkTarget();
	if (
		target &&
		(target.kind === LinkTargetKind.Project || target.kind === LinkTargetKind.Solution)
	) {
		link([target.target], { workingDirectory: vscode.workspace.rootPath, logger });
		vscode.window.showInformationMessage(`Linked all packages in ${target.target}`);
	} else if (target) {
		vscode.window.showInformationMessage('Only projects and solutions are supported at this time.');
	}
}

async function pickLinkTarget(): Promise<LinkTarget | undefined> {
	const targets = await findLinkTargets();
	let options: vscode.QuickPickOptions = {
		ignoreFocusOut: true,
		matchOnDescription: true,
		matchOnDetail: true,
		placeHolder: 'Select a project or solution to link',
	};

	const choice = await vscode.window.showQuickPick(targets.map(x => x.label), options);
	return (choice && targets.filter(x => x.label === choice)[0]) || undefined;
}
