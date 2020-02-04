import { requireTool } from './shell-utility';

export const getEnvironmentSnapshot = () => {
	const nodeVersion = requireTool('node')('--version', {})
		.trim()
		.replace('v', '');
	const nugetVersion = requireTool('nuget')('help', {})
		.split('\n')[0]
		.split(' ')
		.slice(-1)[0];
	const dotnetVersion = requireTool('dotnet')('--version', {}).trim();
	return { nodeVersion, nugetVersion, dotnetVersion };
};
