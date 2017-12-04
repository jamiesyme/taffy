const Taffy = require('../.');

module.exports = async (files, tags) => {
	// Split tag string on commas and whitespace
	tags = (tags || '').split(/[,\s]+/);

	// Add each file
	for (const file of files) {
		try {
			await Taffy.addFile(file, tags);
		} catch (e) {
			if (e instanceof Taffy.CannotAddDirectoryError) {
				console.log('Ignoring directory:', e.path);
			} else {
				throw e;
			}
		}
	}
};
