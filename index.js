const Program = require('commander');
const Commands = require('./lib/commands');

function withErrors(cb) {
	return async (...args) => {
		try {
			await cb(...args);
		} catch (e) {
			console.log(e);
			process.exit(1);
		}
	}
}

Program.version('0.1.0');

Program
	.command('add <files...>')
	.option('-t, --tags <tags...>', 'tags to attach')
	.action(
		withErrors(
			async (env, options) => {
				await Commands.add(env, options.tags);
			}
		)
	);

Program
	.command('ls [tags...]')
	.action(
		withErrors(
			async (env, options) => {
				await Commands.ls(env);
			}
		)
	);

Program.parse(process.argv);
