# Taffy

Taffy is an experiment to explore tag-based file systems. It runs on top of an existing file system, and requires the use of hard links.

## Usage

```bash
$ node index.js add --tags="taffy documentation" README.md

$ node index.js add --tags="taffy npm" package.json yarn.lock

$ node index.js ls
4b4df306-f5d7-4f43-b57b-38cd6a497c35    taffy documentation
4a23c39e-8013-4259-941f-c99ac122cbaf    taffy npm
a51e5492-b8c7-47eb-a716-0a860370a024    taffy npm

$ node index.js ls taffy documentation
4b4df306-f5d7-4f43-b57b-38cd6a497c35    taffy documentation
```

## Bloom Filters

When using `ls` with multiple tags, all of the tags are ANDed together. This can be a very expensive operation if the first tag returns a lot of results.

To optimize this (and to seize the opportunity to explore an exciting topic), bloom filters are maintained per tag. Instead of querying the underlying file system thousands of times to see if the files resulting from the first query have the second tag, they are checked against the second tag's bloom filter. This will tell us if the file is "definitely not" tagged with the second tag, and allows us to quickly filter out a bunch of files.

Overall, this "optimization" slows down the system quite a bit. `add` operations have to maintain the filters, and `ls` operations have the option of disabling the optimization with `--no-bloom`. The bloom filters help eventually, when the first query returns >20k files, but until then, they only serve to slow things down.
