const Taffy = require('../.');

module.exports = async (tags) => {
	function listFile (file) {
		console.log(file.id + '    ' + file.tags.join(' '));
	}

	// List all files
	if (!tags || tags.length === 0) {
		await Taffy.forEachFile(listFile);
		return;
	}

	// List untagged files
	if (tags[0].toLowerCase() === 'untagged') {
		await Taffy.forEachUntaggedFile(listFile);
		return;
	}

	// List tagged files
	await Taffy.forEachTaggedFile(tags, listFile);
};
