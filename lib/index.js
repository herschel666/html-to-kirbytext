
const last = require('ramda/src/last');
const times = require('ramda/src/times');
const identity = require('ramda/src/identity');
const compose = require('ramda/src/compose');

const ALLOWED_VIDEO_TYPES = ['youtube', 'vimeo'];

const slice = x => [].slice.call(x);

const trimLeft = exports.trimLeft =
    str => str.replace(/^\s+/, '');

const removeLineBreaks = exports.removeLineBreaks =
    str => str.replace(/\n+/, ' ');

const trimmedOneliner = exports.trimmedOneliner =
    compose(removeLineBreaks, trimLeft);

const removeScripts = exports.removeScripts =
    document => {
        slice(document.getElementsByTagName('script')).forEach(script =>
            script.parentNode.removeChild(script));
        return document;
    };

const removeLeadingWhitespace = exports.removeLeadingWhitespace =
    document => {
        /* eslint "no-param-reassign": 0 */
        const lines = document.body.innerHTML.split(/\n/);
        document.body.innerHTML = lines
            .map(trimLeft)
            .join('\n');
        return document;
    };

const normalizeWhitespace = exports.normalizeWhitespace =
    document => {
        const elements = 'h1, h2, h3, h4, h5, h6, p, li, blockquote';
        slice(document.querySelectorAll(elements))
            .forEach(elem => {
                /* eslint "no-param-reassign": 0 */
                elem.innerHTML = trimmedOneliner(elem.innerHTML);
            });
        return document;
    };

const markHeadlines = exports.markHeadlines =
    document => {
        slice(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .forEach(headline => {
                /* eslint "no-param-reassign": 0 */
                headline.innerHTML = `${times(() => '#', headline.nodeName[1]).join('')}` +
                    ` ${headline.innerHTML}`;
            });
        return document;
    };

const markImages = exports.markImages =
    document => {
        slice(document.images).forEach(img => {
            const isLinked = img.parentNode.nodeName.toLowerCase() === 'a';
            const caption = img.parentNode.querySelector('figcaption');
            const hasCaption = caption && caption.textContent;
            const result = [`(image: ${img.src} alt: ${img.alt}`];
            if (img.width) {
                result.push(`width: ${img.width}`);
            }
            if (img.height) {
                result.push(`height: ${img.height}`);
            }
            if (img.className) {
                result.push(`class: ${img.className.trim()}`);
            }
            if (isLinked) {
                result.push(`link: ${img.parentNode.href}`);
            }
            if (hasCaption) {
                result.push(`caption: ${caption.textContent}`);
            }
            const node = document
                .createTextNode(`${result.join(' ')})`);
            const target = isLinked || hasCaption ? img.parentNode : img;
            target.parentNode.replaceChild(node, target);
        });
        return document;
    };

const markBold = exports.markBold =
    document => {
        slice(document.querySelectorAll('b, strong'))
            .forEach(elem => {
                elem.innerHTML = `**${elem.innerHTML}**`;
            });
        return document;
    };

const markItalic = exports.markItalic =
    document => {
        slice(document.querySelectorAll('i, em'))
            .forEach(elem => {
                elem.innerHTML = `_${elem.innerHTML}_`;
            });
        return document;
    };

const markRuler = exports.markRuler =
    document => {
        slice(document.getElementsByTagName('hr'))
            .forEach(elem => {
                const node = document.createTextNode('****');
                elem.parentNode.replaceChild(node, elem);
            });
        return document;
    };

const markQuotes = exports.markQuotes =
    document => {
        slice(document.getElementsByTagName('blockquote'))
            .forEach(quote => {
                quote.innerHTML = `> ${quote.innerHTML}`;
            });
        return document;
    };

const markCodeBlocks = exports.markCodeBlocks =
    document => {
        slice(document.querySelectorAll('pre > code'))
            .forEach(code => {
                /* eslint "prefer-template": 0 */
                code.parentNode.innerHTML = '```\n' +
                    trimLeft(code.innerHTML) + '\n```';
            });
        return document;
    };

const markInlineCode = exports.markInlineCode =
    document => {
        slice(document.getElementsByTagName('code'))
            .forEach(code => {
                code.innerHTML = `\`${code.innerHTML}\``;
            });
        return document;
    };

const markLists = exports.markLists =
    type => document => {
        slice(document.getElementsByTagName(type))
            .forEach(list => slice(list.children)
                .forEach((item, i) => {
                    const prefix = type === 'ol' ? `${i + 1}. ` : '- ';
                    item.innerHTML = prefix + trimLeft(item.innerHTML);
                }));
        return document;
    };

const markLinks = exports.markLinks =
    (filter, name) => document => {
        slice(document.querySelectorAll(`a${filter}`))
            .forEach(link => {
                const href = link.href.replace('mailto:', '').replace('tel:', '');
                const text = link.textContent.trim();
                const result = [`(${name}: ${href} text: ${text}`];
                if (link.target && link.target.indexOf('blank')) {
                    result.push('popup: yes');
                }
                if (link.title) {
                    result.push(`title: ${link.title}`);
                }
                if (link.className) {
                    result.push(`class: ${link.className}`);
                }
                const node = document
                    .createTextNode(`${result.join(' ')})`);
                link.parentNode.replaceChild(node, link);
            });
        return document;
    };

const markVideoEmbeds = exports.markVideoEmbeds =
    type => document => {
        if (ALLOWED_VIDEO_TYPES.indexOf(type) === -1) {
            throw Error(`${type} is not a supported video type. ` +
                `Please use ${ALLOWED_VIDEO_TYPES.join(' or ')}.`);
        }
        slice(document.getElementsByTagName('iframe'))
            .filter(elem => elem.src.indexOf(type) > -1)
            .forEach(elem => {
                const result = [`(${type}: ${elem.src}`];
                if (elem.width) {
                    result.push(`width: ${elem.width}`);
                }
                if (elem.height) {
                    result.push(`height: ${elem.height}`);
                }
                elem.parentNode.replaceChild(
                    document.createTextNode(`${result.join(' ')})`),
                    elem);
            });
        return document;
    };

const normalizeEmptyLines = exports.normalizeEmptyLines =
    document => {
        const lines = document.body.textContent.split(/\n/);
        return lines
            .reduce((acc, line) => {
                if (!line && !last(acc)) {
                    return acc.slice(0);
                }
                return acc.concat([line]);
            }, [])
            .join('\n');
    };

exports.convert = exports.default = (doc, customFn) => {
    const saveCustomFn = typeof customFn === 'function' ?
        customFn : identity;
    return compose(
        normalizeEmptyLines,
        markVideoEmbeds('vimeo'),
        markVideoEmbeds('youtube'),
        markLinks('', 'link'),
        markLinks('[href^="tel"]', 'tel'),
        markLinks('[href^="mailto"]', 'mail'),
        markLists('ul'),
        markLists('ol'),
        markInlineCode,
        markCodeBlocks,
        markQuotes,
        markRuler,
        markItalic,
        markBold,
        markImages,
        markHeadlines,

        saveCustomFn,

        normalizeWhitespace,
        removeLeadingWhitespace,
        removeScripts)(doc);
};
