const Taffy = require('../.');

module.exports = (tags) => {
	if (!tags || tags.length === 0) {
		return listAllFiles();
	}

	if (tags[0].toLowerCase() === 'untagged') {
		return listUntaggedFiles();
	}

	listTaggedFiles(tags[0]);
};

function listAllFiles () {
	Taffy.forEachFile(listFile);
}

function listUntaggedFiles () {
	Taffy.forEachUntaggedFile(listFile);
}

function listTaggedFiles (tag) {
	Taffy.forEachTaggedFile(tag, listFile);
}

function listFile (file) {
	console.log(file.id + '    ' + file.tags.join(' '));
}
