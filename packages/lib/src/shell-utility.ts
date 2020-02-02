import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as shell from 'shelljs';

export type ExecToolFunction = (
	command: string,
	options: shell.ExecOptions & { async?: false }
) => shell.ShellString;

export function requireTool(name: string): ExecToolFunction {
	const toolPath = resolveToolPath(name);
	return (args: string, options?: shell.ExecOptions & { async?: false }) => {
		shell.config.execPath = shell.which('node').toString();
		return shell.exec(`${toolPath} ${args}`, options || {});
	};
}

function resolveToolPath(name: string) {
	if (shell.which(name)) {
		return name;
	}

	let toolPath = null;
	switch (name) {
		case 'nuget':
			toolPath = tryResolveNuget();
			break;
		default:
			break;
	}

	if (!toolPath) {
		throw new Error(`Tool is not in path and there is no built-in resolution: ${name}`);
	}

	return toolPath;
}

function tryResolveNuget() {
	// Default install path for Windows, conveniently stripped from VSCode extension context's PATH.
	const windowsInstallPath = path.join(os.homedir(), 'bin', 'nuget.exe');
	if (process.platform === 'win32' && fs.existsSync(windowsInstallPath)) {
		return windowsInstallPath;
	}

	// TODO: Fallback to location in dotnet?

	// TODO: Use custom override path

	return null;
}
