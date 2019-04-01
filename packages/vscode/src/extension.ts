import * as vscode from 'vscode';
import { readRegistry } from 'nuget-extensions-lib';
import { startWatchTask, stopWatchTask } from './commands/watch';
import { executeRegisterCommand } from './commands/register';
import { executeLinkCommand } from './commands/link';

export function activate(context: vscode.ExtensionContext) {
	const channel = vscode.window.createOutputChannel('NuGet Extensions (general)');
	const logger = {
		log: (x: string) => channel.appendLine(x),
		error: (x: string) => channel.appendLine(`ERROR: ${x}`),
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.nugex.register', async () => {
			executeRegisterCommand(logger);
		}),
		vscode.commands.registerCommand('extension.nugex.link', async () => {
			executeLinkCommand(logger);
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
