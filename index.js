const Program = require('commander');
const Commands = require('./lib/commands');

function help () {
	console.log('');
	console.log('  Usage:');
	console.log('    taffy add [--tags <tag>...] <file>...');
	console.log('    taffy ls [--no-bloom] [<tag>...]');
	console.log('    taffy -h | --help');
	console.log('    taffy --version');
	console.log('');
	console.log('  Options:');
	console.log('    -h --help   Show this screen.');
	console.log('    --version   Show version.');
	console.log('    --tags      Tags for new file(s).');
	console.log('    --no-bloom  Disable bloom filter optimization.');
	console.log('');
	process.exit(1);
}

function version () {
	console.log('0.1.0');
	process.exit(0);
}

async function add (args) {
	let tags = [];
	let files = [];
	if (args.length > 0) {
		if (args[0].match(/^--tags$/)) {
			tags = args[1].split(' ');
			args = args.slice(2);
		} else if (args[0].match(/^--tags=/)) {
			tags = args[0].split('=', 2)[1].split(' ');
			args = args.slice(1);
		}
	}
	files = args;
	await Commands.add(files, tags);
	process.exit(0);
}

async function ls (args) {
	let tags = [];
	let bloom = true;
	if (args.length > 0) {
		if (args[0].match(/^--no-bloom$/)) {
			bloom = false;
			args = args.slice(1);
		}
	}
	tags = args;
	await Commands.ls(tags, bloom);
	process.exit(0);
}

async function main () {
	let args = process.argv.slice(2);
	switch (args[0]) {
	case 'add':
		await add(args.slice(1));
		break;

	case 'ls':
		await ls(args.slice(1));
		break;

	case '--version':
		version();
		break;

	case '-h':
	case '--help':
	default:
		help();
		break;
	}
}
main();
