import * as vscode from 'vscode';
import { unlink, findUnlinkTargets, IUnlinkTarget, ILogger } from 'nuget-extensions-lib';
import { findLinkTargets, LinkTarget, LinkTargetKind } from './link-utility';

export async function executeUnlinkCommand(logger: ILogger) {
	const target = await pickLinkTarget();
	if (
		target &&
		(target.kind === LinkTargetKind.Project || target.kind === LinkTargetKind.Solution)
	) {
		const unlinkTarget = await pickUnlinkTarget(target, logger);
		if (unlinkTarget) {
			unlink([unlinkTarget]);
			vscode.window.showInformationMessage(
				`Unlinked all packages matching '${unlinkTarget.pattern}' in ${target.target}`
			);
		}
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
		placeHolder: 'Select a project or solution to unlink',
	};

	const choice = await vscode.window.showQuickPick(targets.map(x => x.label), options);
	return (choice && targets.filter(x => x.label === choice)[0]) || undefined;
}

async function pickUnlinkTarget(
	target: LinkTarget,
	logger: ILogger
): Promise<IUnlinkTarget | undefined> {
	const targets = findUnlinkTargets([target.target], { logger });
	let options: vscode.QuickPickOptions = {
		ignoreFocusOut: true,
		matchOnDescription: true,
		matchOnDetail: true,
		placeHolder: 'Select package(s) to unlink',
	};

	const choice = await vscode.window.showQuickPick(targets.map(x => x.pattern), options);
	return (choice && targets.filter(x => x.pattern === choice)[0]) || undefined;
}
