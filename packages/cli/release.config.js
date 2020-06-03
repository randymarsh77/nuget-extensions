module.exports = {
	branches: ['release'],
	tagFormat: 'cli@v${version}',
	plugins: [
		[
			'filtered-commit-analyzer',
			{
				preset: 'angular',
				filterRules: {
					scope: 'cli',
				},
			},
		],
		'@semantic-release/npm',
	],
};
