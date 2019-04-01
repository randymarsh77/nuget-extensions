import * as vscode from 'vscode';
import { watch } from 'nuget-extensions-lib';
import { FSWatcher } from 'fs';

interface IWatchState {
	watchers: FSWatcher[];
	channel: vscode.OutputChannel;
}

export async function startWatchTask(context: vscode.ExtensionContext) {
	const state = getWatchState(context);
	if (state) {
		vscode.window.showErrorMessage(`There is already a current watch task.`);
		return;
	}

	const { shortCircuitBuild } = getWatchConfiguration();
	const { channel, watchLogger } = createOutputChannel();

	const watchers = watch({
		shortCircuitBuild,
		workingDirectory: vscode.workspace.rootPath,
		logger: watchLogger,
	});

	updateWatchState(context, {
		watchers,
		channel,
	});

	const shouldShowOutput = await vscode.window.showInformationMessage(
		`Starting to watch for changes to linked NuGet package changes.\nShort circuiting is ${
			shortCircuitBuild ? 'ON' : 'OFF'
		}.`,
		{},
		{ title: 'Show Output' }
	);

	if (shouldShowOutput) {
		channel.show();
	}
}

export function stopWatchTask(context: vscode.ExtensionContext) {
	const state = getWatchState(context);
	if (!state) {
		vscode.window.showErrorMessage(`There is no current watch task.`);
		return;
	}

	const { watchers, channel } = state;
	(watchers || []).forEach(x => x.close());
	channel.hide();
	channel.dispose();

	updateWatchState(context, null);

	vscode.window.showInformationMessage(`The watch task has been stopped.`);
}

function createOutputChannel() {
	const channel = vscode.window.createOutputChannel('NuGet Extensions (watch)');
	const watchLogger = {
		log: (x: string) => channel.appendLine(x),
		error: (x: string) => channel.appendLine(`ERROR: ${x}`),
	};
	return { channel, watchLogger };
}

function getWatchConfiguration() {
	const config = vscode.workspace.getConfiguration('Nuget Extensions');
	const paths = (config.get<string>('shortCircuitPaths') || '')
		.split(',')
		.map(x => x.replace('${workspaceFolder}', vscode.workspace.rootPath || ''));
	const shortCircuitBuild = (paths.length !== 0 && paths[0]) || undefined;

	return { shortCircuitBuild };
}

const watchStateKey = 'nugex.state.watch';

function getWatchState(context: vscode.ExtensionContext): IWatchState {
	return context.workspaceState.get(watchStateKey) as IWatchState;
}

function updateWatchState(context: vscode.ExtensionContext, state: IWatchState | null) {
	context.workspaceState.update(watchStateKey, state);
}
