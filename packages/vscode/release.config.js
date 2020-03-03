module.exports = {
	branches: ['release'],
	tagFormat: 'vscode@v${version}',
	plugins: [
		[
			'filtered-commit-analyzer',
			{
				preset: 'angular',
				filterRules: {
					scope: 'vscode',
				},
			},
		],
		[
			'@semantic-release/npm',
			{
				npmPublish: false,
			},
		],
		[
			'@semantic-release/github',
			{
				assets: [{ path: 'packages/vscode/*.vsix', label: 'VSIX' }],
			},
		],
	],
};
