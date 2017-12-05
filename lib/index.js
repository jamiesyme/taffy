const Path = require('path');
const Fs = require('fs-extra');
const Uuid = require('uuid/v4');
const BloomFilter = require('./bloom-filter');


// Error types
// ===========

class CannotAddDirectoryError extends Error {
	constructor (path) {
		super();
		this.path = path;
	}
}

class FileNotFoundError extends Error {
	constructor (path) {
		super();
		this.path = path;
	}
}

class ReservedTagError extends Error {
	constructor (tag) {
		super();
		this.tag = tag;
	}
}


// Config variables
// ================

const rootDir     = Path.join(process.env.HOME, '.taffy');
const allDir      = Path.join(rootDir, 'files');
const bloomDir    = Path.join(rootDir, 'bloom-filters-by-tag');
const infoDir     = Path.join(rootDir, 'file-info');
const taggedDir   = Path.join(rootDir, 'files-by-tag');
const untaggedDir = Path.join(rootDir, 'files-untagged');

const reservedTags = ['and', 'or', 'untagged'];

const maintainBloomFilters = true;
let useBloomFilters = true;


// Functions
// =========

async function addFile (srcPath, tags) {

	// Check that the srcPath exists
	const srcPathExists = await Fs.pathExists(srcPath);
	if (!srcPathExists) {
		throw new FileNotFoundError(srcPath);
	}
	const srcPathStats = await Fs.lstat(srcPath);
	if (srcPathStats.isDirectory()) {
		throw new CannotAddDirectoryError(srcPath);
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
			// Create the tag (if needed)
			const tagDir = Path.join(taggedDir, tag);
			const tagExists = await Fs.pathExists(tagDir);
			if (!tagExists) {
				// Create the tag dir
				await Fs.ensureDir(tagDir);

				// Create the tag bloom filter
				if (maintainBloomFilters) {
					const bf = new BloomFilter(128*1024, 8);
					const bfData = bf.serialize();
					const bfPath = Path.join(bloomDir, tag);
					await Fs.writeFile(bfPath, bfData);
				}
			}

			// Add the file to the files-by-tag dir
			const tagFilePath = Path.join(tagDir, fileId);
			await Fs.link(filePath, tagFilePath);

			// Update the bloom filter
			if (maintainBloomFilters) {
				const bfPath = Path.join(bloomDir, tag);
				let   bfData = await Fs.readFile(bfPath);
				const bf = BloomFilter.deserialize(bfData);
				bf.add(fileId);
				bfData = bf.serialize();
				await Fs.writeFile(bfPath, bfData);
			}
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
	const files = await Fs.readdir(allDir);
	for (const fileId of files) {
		const info = await getFileInfo(fileId);
		cb(info);
	}
}


async function forEachTaggedFile (tags, cb) {
	let files = null;
	for (const tag of tags) {

		// We are expected to AND the tags together, so if any tag doesn't exist,
		// no files should pass
		const tagDirPath = Path.join(taggedDir, tag);
		const tagExists = await Fs.pathExists(tagDirPath);
		if (!tagExists) {
			return;
		}

		// For the first tag, we'll load a list of files that we can then filter
		// using the remaining tags
		if (!files) {
			files = await Fs.readdir(tagDirPath);
			continue;
		}

		// If using bloom filters, load the filter by tag
		let bf = null;
		if (useBloomFilters) {
			const bfPath = Path.join(bloomDir, tag);
			const bfData = await Fs.readFile(bfPath);
			bf = BloomFilter.deserialize(bfData);
		}

		// Filter the files by the tag
		for (let i = 0; i < files.length; ++i) {
			// Try the bloom filter first
			if (bf) {
				if (!bf.test(files[i])) {
					files[i] = null;
					continue;
				}
			}

			// Fall back to checking the file path
			const filePath = Path.join(tagDirPath, files[i]);
			const fileExists = await Fs.pathExists(filePath);
			if (!fileExists) {
				files[i] = null;
			}
		}
		files = files.filter(f => !!f); // Remove null values
	}

	// If no files were loaded, we're done
	if (!files) {
		return;
	}

	// Iterate over our final list of files
	for (const fileId of files) {
		const info = await getFileInfo(fileId);
		cb(info);
	}
}


async function forEachUntaggedFile (cb) {
	const files = await Fs.readdir(untaggedDir);
	for (const fileId of files) {
		const info = await getFileInfo(fileId);
		cb(info);
	}
}


async function getFileInfo (fileId) {
	const path = [infoDir, fileId].join('/');
	return await Fs.readJson(path);
}


function enableBloomFilters() {
	useBloomFilters = true;
}


function disableBloomFilters() {
	useBloomFilters = false;
}


// Exports
// =======

module.exports = {
	CannotAddDirectoryError,
	FileNotFoundError,
	ReservedTagError,
	addFile,
	disableBloomFilters,
	enableBloomFilters,
	forEachFile,
	forEachTaggedFile,
	forEachUntaggedFile,
};
