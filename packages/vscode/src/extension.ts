import * as vscode from 'vscode';
import { link, readRegistry, registerPackages, watch } from 'nuget-extensions-lib';
import { findLinkTargets, LinkTarget, LinkTargetKind } from './link-utility';
import { findRegisterTargets, RegisterTarget, RegisterTargetKind } from './register-utility';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.nugex.register', async () => {
			const target = await pickRegisterTarget();
			if (target && target.kind === RegisterTargetKind.Directory) {
				registerPackages(target.directory);
				vscode.window.showInformationMessage(`Registered all packages in ${target.directory}`);
			} else if (target) {
				vscode.window.showInformationMessage('Only directories are supported at this time.');
			}
		}),
		vscode.commands.registerCommand('extension.nugex.link', async () => {
			const target = await pickLinkTarget();
			if (target && target.kind === LinkTargetKind.Project) {
				link([target.target], { workingDirectory: vscode.workspace.rootPath });
				vscode.window.showInformationMessage(`Linked all packages in ${target.target}`);
			} else if (target) {
				vscode.window.showInformationMessage('Only projects are supported at this time.');
			}
		}),
		vscode.commands.registerCommand('extension.nugex.list', async () => {
			vscode.window.showInformationMessage(JSON.stringify(readRegistry(), null, 2));
		}),
		vscode.commands.registerCommand('extension.nugex.watch', async () => {
			const config = vscode.workspace.getConfiguration('Nuget Extensions');
			const paths = (config.get<string>('shortCircuitPaths') || '')
				.split(',')
				.map(x => x.replace('${workspaceFolder}', vscode.workspace.rootPath || ''));

			watch({
				shortCircuitBuild: (paths.length !== 0 && paths[0]) || undefined,
				workingDirectory: vscode.workspace.rootPath,
			});
		})
	);
}

export function deactivate() {}

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
