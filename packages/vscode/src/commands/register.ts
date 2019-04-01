import * as vscode from 'vscode';
import { registerPackages, ILogger } from 'nuget-extensions-lib';
import { findRegisterTargets, RegisterTarget, RegisterTargetKind } from './register-utility';

export async function executeRegisterCommand(logger: ILogger) {
	const target = await pickRegisterTarget();
	if (target && target.kind === RegisterTargetKind.Directory) {
		registerPackages(target.directory, { logger });
		vscode.window.showInformationMessage(`Registered all packages in ${target.directory}`);
	} else if (target) {
		vscode.window.showInformationMessage('Only directories are supported at this time.');
	}
}

async function pickRegisterTarget(): Promise<RegisterTarget | undefined> {
	const targets = await findRegisterTargets();
	let options: vscode.QuickPickOptions = {
		ignoreFocusOut: true,
		matchOnDescription: true,
		matchOnDetail: true,
		placeHolder: 'Select a package or directory to register',
	};

	const choice = await vscode.window.showQuickPick(targets.map(x => x.label), options);
	return (choice && targets.filter(x => x.label === choice)[0]) || undefined;
}
