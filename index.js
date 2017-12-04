const Program = require('commander');
const Commands = require('./lib/commands');

Program.version('0.1.0');

Program
	.command('add <files...>')
	.option('-t, --tags <tags...>', 'tags to attach')
	.action((env, options) => {
		Commands.add(env, options.tags);
	});

Program
	.command('ls [tags...]')
	.action((env, options) => {
		Commands.ls(env);
	});

Program.parse(process.argv);
