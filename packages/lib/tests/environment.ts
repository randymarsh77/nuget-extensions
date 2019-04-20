import * as path from 'path';
import * as rimraf from 'rimraf';
import * as uuid from 'uuid';

export function withTestEnvironment(action: () => void) {
	const previous = process.env.NUGEX_DIR;
	const testEnv = path.join(process.cwd(), 'tests', 'data', uuid.v1());
	process.env.NUGEX_DIR = testEnv;
	action();
	process.env.NUGEX_DIR = previous;
	rimraf.sync(testEnv);
}
