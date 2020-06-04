const path = require('path');
const shell = require('shelljs');

const pathToPackage = pkg => path.join(__dirname, '..', '..', 'packages', pkg);

module.exports = {
	publish: () => {
		const vscode = {
			cwd: pathToPackage('vscode'),
		};
		shell.exec('npx vsce package --yarn', vscode);
		shell.exec(`npx vsce publish -p ${process.env.VSCE_TOKEN} --yarn`, vscode);
	},
};
