import * as vscode from 'vscode';
import { link } from 'nuget-extensions-lib';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.nugex.link', () => {
			const config = vscode.workspace.getConfiguration('Nuget Extensions');
			const projects = (config.get<string>('defaultProjects') || '').split(',');
			if (projects.length !== 0) {
				link(projects);
			} else {
				vscode.window.showInformationMessage(
					'You need to set the Nuget Extensions Default Projects setting.'
				);
			}
		})
	);
}

export function deactivate() {}
