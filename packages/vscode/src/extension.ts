import * as vscode from 'vscode';
import { link, readRegistry, registerPackages } from 'nuget-extensions-lib';
import { findLinkTargets, LinkTarget, LinkTargetKind } from './link-utility';
import { findRegisterTargets, RegisterTarget, RegisterTargetKind } from './register-utility';
import { startWatchTask, stopWatchTask } from './commands/watch';

export function activate(context: vscode.ExtensionContext) {
	const channel = vscode.window.createOutputChannel('NuGet Extensions (general)');
	const logger = {
		log: (x: string) => channel.appendLine(x),
		error: (x: string) => channel.appendLine(`ERROR: ${x}`),
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.nugex.register', async () => {
			const target = await pickRegisterTarget();
			if (target && target.kind === RegisterTargetKind.Directory) {
				registerPackages(target.directory, { logger });
				vscode.window.showInformationMessage(`Registered all packages in ${target.directory}`);
			} else if (target) {
				vscode.window.showInformationMessage('Only directories are supported at this time.');
			}
		}),
		vscode.commands.registerCommand('extension.nugex.link', async () => {
			const target = await pickLinkTarget();
			if (
				target &&
				(target.kind === LinkTargetKind.Project || target.kind === LinkTargetKind.Solution)
			) {
				link([target.target], { workingDirectory: vscode.workspace.rootPath, logger });
				vscode.window.showInformationMessage(`Linked all packages in ${target.target}`);
			} else if (target) {
				vscode.window.showInformationMessage(
					'Only projects and solutions are supported at this time.'
				);
			}
		}),
		vscode.commands.registerCommand('extension.nugex.list', async () => {
			vscode.window.showInformationMessage(JSON.stringify(readRegistry(), null, 2));
		}),
		vscode.commands.registerCommand('extension.nugex.startWatchTask', async () => {
			startWatchTask(context);
		}),
		vscode.commands.registerCommand('extension.nugex.stopWatchTask', async () => {
			stopWatchTask(context);
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
