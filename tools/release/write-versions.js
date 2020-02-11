const fs = require('fs');
const path = require('path');
const GitHub = require('github-api');
const shell = require('shelljs');

const packages = ['lib', 'cli', 'vscode'];
const validPrefixes = ['major', 'minor', 'patch'];
const validScopes = ['all', ...packages];
const versionChangeRegEx = new RegExp(
	`(${validPrefixes.join('|')})\\((${validScopes.join('|')})\\)`,
	'gm'
);

function isValidMessage(message) {
	return validPrefixes.reduce((acc, v) => acc || !!versionChangeRegEx.exec(message), false);
}

function getWinningChange(current, change) {
	if (!current) {
		return change;
	}

	return validPrefixes.indexOf(current) < validPrefixes.indexOf(change) ? current : change;
}

function getChanges(message) {
	const changes = [...message.matchAll(versionChangeRegEx)];
	return changes
		.flatMap(x => {
			const [_, scope, change] = x;
			if (scope !== 'all') {
				return x;
			}

			return [...packages.map(p => [_, p, change])];
		})
		.reduce((acc, v) => {
			const [_, change, scope] = v;
			return {
				...acc,
				[scope]: getWinningChange(acc[scope], change),
			};
		}, {});
}

async function getCommitsAffectingNewVersions() {
	const gh = new GitHub();
	const repo = gh.getRepo('randymarsh77', 'nuget-extensions');
	const tags = await repo.listTags();
	const lastReleaseSha = tags.data[0].commit.sha;
	const lastReleaseCommit = await repo.getCommit(lastReleaseSha);
	const since = lastReleaseCommit.data.committer.date;
	const commits = await repo.listCommits({ since });
	const messages = commits.data.map(x => x.commit.message).filter(isValidMessage);
	return messages;
}

function writeNewVersion(pkg, change) {
	const bumpMajor = change === 'major';
	const bumpMinor = change === 'minor';
	const bumpPatch = change === 'patch';
	const packagePath = path.join('..', 'packages', pkg, 'package.json');
	const packageData = require(packagePath);
	const [major, minor, patch] = packageData.version.split('.').map(parseInt);
	const updated = `${major + (bumpMajor ? 1 : 0)}.${bumpMajor ? 0 : minor + bumpMinor ? 1 : 0}.${
		bumpPatch ? patch + 1 : 0
	}`;
	packageData.version = updated;
	fs.writeFileSync(packagePath, packageData);
	return pkg;
}

(async () => {
	const messages = await getCommitsAffectingNewVersions();
	const changes = getChanges(messages.join('\n'));
	const needsPublishing = new Set(Object.keys(changes).map(pkg => writeNewVersion(pkg, changes)));
	const publishLib = needsPublishing.has('lib');
	const publishWithLerna = publishLib || needsPublishing.has('cli');

	if (publishWithLerna) {
		// TODO
	}

	if (publishLib) {
		shell.exec('yarn remove nuget-extentions-lib && yarn add nuget-extensions-lib', {
			cwd: path.join('packages', 'vscode'),
		});
		if (!needsPublishing.has('vscode')) {
			writeNewVersion('vscode', 'patch');
		}
	}

	if (publishLib || needsPublishing.has('vscode')) {
		// TODO - Finish - Doh!
		// shell.exec('npx vsce --publish', {
		// 	cwd: path.join('packages', 'vscode'),
		// });
	}
})();
