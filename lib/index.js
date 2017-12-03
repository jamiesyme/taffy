const Fs = require('fs-extra');

const rootDir     = [process.env.HOME, '.taffy'].join('/');
const allDir      = [rootDir, 'all-files'].join('/');
const infoDir     = [rootDir, 'file-info'].join('/');
const taggedDir   = [rootDir, 'tagged-files'].join('/');
const untaggedDir = [rootDir, 'untagged-files'].join('/');

module.exports.forEachFile = async (cb) => {
	await forEachFileInfoInDir(allDir, cb);
};

module.exports.forEachUntaggedFile = async (cb) => {
	await forEachFileInfoInDir(untaggedDir, cb);
};

module.exports.forEachTaggedFile = async (tag, cb) => {
	const tagDir = [taggedDir, tag].join('/');
	await forEachFileInfoInDir(tagDir, cb);
};

async function forEachFileInfoInDir (dir, cb) {
	async function onFile (fileId) {
		const info = await getFileInfo(fileId);
		cb(info);
	}
	await forEachFileInDir(dir, onFile);
}

async function forEachFileInDir (dir, cb) {
	if (await Fs.pathExists(dir)) {
		const files = await Fs.readdir(dir);
		files.forEach(cb);
	}
}

async function getFileInfo (fileId) {
	const path = [infoDir, fileId].join('/');
	return await Fs.readJson(path);
}
