import * as vscode from 'vscode';
import { registerPackages, registerPackagesInDirectory, ILogger } from 'nuget-extensions-lib';
import { findRegisterTargets, RegisterTarget, RegisterTargetKind } from './register-utility';

export async function executeRegisterCommand(logger: ILogger) {
	const target = await pickRegisterTarget();
	if (target && target.kind === RegisterTargetKind.Directory) {
		registerPackagesInDirectory(target.directory, { logger });
		vscode.window.showInformationMessage(`Registered all packages in ${target.directory}`);
	} else if (target) {
		registerPackages([target.label], target.directory, { logger });
		vscode.window.showInformationMessage(`Registered ${target.label}`);
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
