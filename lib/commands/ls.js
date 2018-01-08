const Taffy = require('../.');

module.exports = async (tags, useBloomFilters) => {
	function listFile (file) {
		console.log(file.id + '  ' + file.tags.join(' '));
	}

	// Enable/disable bloom filters
	if (useBloomFilters) {
		Taffy.enableBloomFilters();
	} else {
		Taffy.disableBloomFilters();
	}

	// List all files
	if (!tags || tags.length === 0) {
		await Taffy.forEachFile(listFile);
		console.log('');
		return;
	}

	// List untagged files
	if (tags[0].toLowerCase() === 'untagged') {
		await Taffy.forEachUntaggedFile(listFile);
		console.log('');
		return;
	}

	// List tagged files
	await Taffy.forEachTaggedFile(tags, listFile);
	console.log('');
};
