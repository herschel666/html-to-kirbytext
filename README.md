HTML-to-Kirbytext
====

> Converts an HTML string to Kirbytext markdown.

**Note:** This is a preliminary version with an inferior approach to parsing the HTML.

## Installation

Get the package via npm:

```
npm install -S html-to-kirbytext
```

## Usage

### On the server

```javascript
const h2k = require('html-to-kirbytext').convert;
const reader = require('html-to-kirbytext/lib/server-reader');

const html = `<h1>A document</h1>
<p>…
…
`;

const result = h2k(reader(html));
```

### In the browser

Assuming you transpile the code with [Babel](https://babeljs.io/), [Browserify](http://browserify.org/), [Rollup](http://rollupjs.org/), etc.

```javascript
const h2k = require('html-to-kirbytext').convert;
const reader = require('html-to-kirbytext/lib/browser-reader');

const html = `<h1>Another document</h1>
<p>…
…
`;

const result = h2k(reader(html));
```

### Passing a custom converter function

```javascript
// The custom converter function gets the `document`-
// object passed in as the only argument. This again
// has to be returned. Otherwise the tool errors!
const customConverter = document => {
	// Do something with the DOM.
	// … and return the `document`-object afterwards.
	return document;
};

const result = h2k(reader(html), customConverter);
```

### With the command-line tool

You can either pass in the content via `stdin` by setting the `-/--stdin`-flag:

```bash
$ cat my-page.html | bin/h2k -s
```

Or you can pass the content via the `--html`-flag:

```bash
$ bin/h2k --html "<h1>Hello World</h1> …"
```

## LICENSE

"THE BEER-WARE LICENSE" (Revision 42): <phk@FreeBSD.ORG> wrote this file. As long as you retain this notice you can do whatever you want with this stuff. If we meet some day, and you think this stuff is worth it, you can buy me a beer in return.
