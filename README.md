# Taffy

Taffy is an experiment to explore tag-based file systems. It runs on top of an existing file system, and requires the use of hard links.

## Usage

```bash
$ taffy --help

  Usage:
    taffy add [--tags <tag>...] <file>...
    taffy ls [--no-bloom] [<tag>...]
    taffy -h | --help
    taffy --version

  Options:
    -h --help   Show this screen.
    --version   Show version.
    --tags      Tags for new file(s).
    --no-bloom  Disable bloom filter optimization.

$ taffy add --tags "2016 summer" pics/2016/summer/*
$ taffy add --tags "2016 winter" pics/2016/winter/*
$ taffy ls
68bf7067-1cb7-4779-8a55-362418d8a167  2016 winter
8671850b-395c-48a3-950a-015412a81865  2016 summer
ede9525a-c902-4ed0-95db-4b833bf12279  2016 winter

$ taffy add --tags "2017 summer" pics/2017/summer/*
$ taffy ls summer
8671850b-395c-48a3-950a-015412a81865  2016 summer
ba241a47-e441-4493-89ee-5a2408fd94f7  2017 summer
ff38eb65-b515-4484-abbc-f6c2dd9e57ee  2017 summer
```

## Bloom Filters

When using `ls` with multiple tags, all of the tags are ANDed together. This can be a very expensive operation if the first tag returns a lot of results.

To optimize this (and to seize the opportunity to explore an exciting topic), bloom filters are maintained per tag. Instead of querying the underlying file system thousands of times to see if the files resulting from the first query have the second tag, they are checked against the second tag's bloom filter. This will tell us if the file is "definitely not" tagged with the second tag, and allows us to quickly filter out a bunch of files.

Overall, this "optimization" slows down the system quite a bit. `add` operations have to maintain the filters, and `ls` operations have the option of disabling the optimization with `--no-bloom`. The bloom filters help eventually, when the first query returns >20k files, but until then, they only serve to slow things down.
