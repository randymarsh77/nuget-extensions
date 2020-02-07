const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const mode = process.env.WEBPACK_MODE || 'development';

module.exports = {
	mode,
	entry: './src/extension.ts',
	target: 'node',
	node: false,
	output: {
		path: path.resolve(__dirname, 'out'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2',
		devtoolModuleFilenameTemplate: '../[resource-path]',
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	devtool: 'source-map',
	externals: {
		vscode: 'commonjs vscode',
	},
	plugins: [new CopyPlugin([{ from: './node_modules/shelljs/src/exec-child.js', to: '' }])],
};
