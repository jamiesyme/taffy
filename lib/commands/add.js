const Taffy = require('../.');

module.exports = (files, tags) => {
	// Split tag string on commas and whitespace
	tags = (tags || '').split(/,\s/);

	// Add each file
	function eachFile(file) {
		Taffy.addFile(file, tags);
	}
	files.forEach(eachFile);
};
