const Taffy = require('../.');

module.exports = async (files, tags) => {
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
