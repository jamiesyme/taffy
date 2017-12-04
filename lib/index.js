const Path = require('path');
const Fs = require('fs-extra');
const Uuid = require('uuid/v4');

class FileNotFoundError extends Error {
	constructor (path) {
		this.path = path;
	}
}

class ReservedTagError extends Error {
	constructor (tag) {
		this.tag = tag;
	}
}

module.exports = {
	FileNotFoundError,
	ReservedTagError,
	addFile,
	forEachFile,
	forEachTaggedFile,
	forEachUntaggedFile,
};

const rootDir     = Path.join(process.env.HOME, '.taffy');
const allDir      = Path.join(rootDir, 'files');
const infoDir     = Path.join(rootDir, 'file-info');
const taggedDir   = Path.join(rootDir, 'files-by-tag');
const untaggedDir = Path.join(rootDir, 'files-untagged');

const reservedTags = ['and', 'or', 'untagged'];


async function addFile (srcPath, tags) {
	// Check that the srcPath exists
	const srcPathExists = await Fs.pathExists(srcPath);
	if (!srcPathExists) {
		throw new FileNotFoundError(srcPath);
	}

	// Check for reserved tags
	if (tags) {
		function checkTag (tag) {
			const reserved = reservedTags.includes(tag);
			if (reserved) {
				throw new ReservedTagError(tag);
			}
		}
		tags.forEach(checkTag);
	}

	// Create the file
	const fileId = Uuid();
	const filePath = Path.join(allDir, fileId);
	await Fs.link(srcPath, filePath);

	// Create the file info
	const fileInfo = {
		id: fileId,
		tags: tags || []
	};
	const fileInfoStr = JSON.stringify(fileInfo);
	const fileInfoPath = Path.join(infoDir, fileId);
	await Fs.writeFile(fileInfoPath, fileInfoStr);

	// Tag the file
	if (tags) {
		async function tagFile (tag) {
			const tagDir = Path.join(taggedDir, tag);
			const tagFilePath = Path.join(tagDir, fileId);
			await Fs.ensureDir(tagDir);
			await Fs.link(filePath, tagFilePath);
		}
		for (const tag of tags) {
			await tagFile(tag);
		}
	}

	// If there are no tags, mark the file as untagged
	if (!tags || tags.length === 0) {
		const path = Path.join(untaggedDir, fileId);
		await Fs.link(filePath, path);
	}
}


async function forEachFile (cb) {
	await forEachFileInfoInDir(allDir, cb);
}


async function forEachTaggedFile (tag, cb) {
	const tagDir = [taggedDir, tag].join('/');
	await forEachFileInfoInDir(tagDir, cb);
}


async function forEachUntaggedFile (cb) {
	await forEachFileInfoInDir(untaggedDir, cb);
}


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
		files.forEach(cb); // TODO: Potential bug if cb is async
	}
}


async function getFileInfo (fileId) {
	const path = [infoDir, fileId].join('/');
	return await Fs.readJson(path);
}
