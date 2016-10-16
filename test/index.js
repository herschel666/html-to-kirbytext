
const expect = require('expect.js');
const sinon = require('sinon');
const jsdom = require('jsdom');
const h2k = require('../lib/');

describe('#trimLeft', () =>
    it('should trim leading white-space', () =>
        expect(h2k.trimLeft('   foo')).to.be('foo')));

describe('#removeLineBreaks', () =>
    it('should remove leading line-breaks', () =>
        expect(h2k.removeLineBreaks(`

foo`)).to.be(' foo')));

describe('#trimmedOneliner', () =>
    it('should remove leading line-breaks & white-space', () =>
        expect(h2k.trimmedOneliner(`


    foo`)).to.be('foo')));

describe('#removeScripts', () => {

    before(function before() {
        this.scripts = [{
            parentNode: { removeChild: sinon.spy() }
        }];
        this.document = {
            getElementsByTagName: sinon.stub().returns(this.scripts)
        };
        this.result = h2k.removeScripts(this.document);
    });

    it('should remove the scripts from the document', function it() {
        const script = this.scripts.shift();
        expect(this.result).to.be(this.document);
        expect(this.document.getElementsByTagName.args[0][0]).to.be('script');
        expect(script.parentNode.removeChild.calledOnce).to.be.ok();
        expect(script.parentNode.removeChild.args[0][0]).to.be(script);
    });

});

describe('#removeLeadingWhitespace', () => {

    before(function before() {
        this.document = {
            body: {
                innerHTML: `  lorem
    ipsum
           dolor
    sit`
            }
        };
        this.result = h2k.removeLeadingWhitespace(this.document);
    });

    it('should remove all leading white-space', function it() {
        expect(this.result).to.be(this.document);
        expect(this.document.body.innerHTML).to.be(`lorem
ipsum
dolor
sit`);
    });

});

describe('#markHeadlines', () => {

    before(function before() {
        this.h1 = {
            innerHTML: 'The headline',
            nodeName: 'H1'
        };
        this.h3 = {
            innerHTML: 'A sub-headline',
            nodeName: 'H3'
        };
        this.document = {
            querySelectorAll: () =>
                [this.h1, this.h3]
        };
        this.result = h2k.markHeadlines(this.document);
    });

    it('should mark headlines', function it() {
        expect(this.result).to.be(this.document);
        expect(this.h1.innerHTML).to.be('# The headline');
        expect(this.h3.innerHTML).to.be('### A sub-headline');
    });

});

describe('#markImages', () => {

    before(function before() {
        this.imgSrc = './path/to/img.jpg';
        this.imgAlt = 'The alt text';
        this.imgWidth = '500';
        this.imgHeight = '300';
        this.imgClass = 'awesome-picture';
        this.imgLink = 'http://foo.com/big-img.jpg';
        this.imgCaption = 'This image is awesomesauce!';
    });

    describe('Basic image', () => {

        before(function before() {
            this.document = jsdom.jsdom(`<img src="${this.imgSrc}" alt="${this.imgAlt}">`, {
                features: {
                    FetchExternalResources: [],
                    ProcessExternalResources: false
                }
            });
            this.result = h2k.markImages(this.document);
        });

        it('should replace the image', function it() {
            expect(this.result).to.be(this.document);
            expect(this.document.body.innerHTML)
                .to.be(`(image: ${this.imgSrc} alt: ${this.imgAlt})`);
        });

    });

    describe('Image with width & height attributes', () => {

        before(function before() {
            this.document = jsdom.jsdom(`<img src="${this.imgSrc}"
                alt="${this.imgAlt}"
                width="${this.imgWidth}"
                height="${this.imgHeight}">`, {
                    features: {
                        FetchExternalResources: [],
                        ProcessExternalResources: false
                    }
                });
            this.result = h2k.markImages(this.document);
        });

        it('should replace the image', function it() {
            expect(this.document.body.innerHTML)
                .to.be(`(image: ${this.imgSrc} alt: ${this.imgAlt} ` +
                    `width: ${this.imgWidth} height: ${this.imgHeight})`);
        });

    });

    describe('Image with a CSS-class', () => {

        before(function before() {
            this.document = jsdom.jsdom(`<img src="${this.imgSrc}"
                alt="${this.imgAlt}"
                class="${this.imgClass}">`, {
                    features: {
                        FetchExternalResources: [],
                        ProcessExternalResources: false
                    }
                });
            this.result = h2k.markImages(this.document);
        });

        it('should replace the image', function it() {
            expect(this.document.body.innerHTML)
                .to.be(`(image: ${this.imgSrc} alt: ${this.imgAlt} ` +
                    `class: ${this.imgClass})`);
        });

    });

    describe('Image wrapped in an <a>-element', () => {

        before(function before() {
            this.document = jsdom.jsdom(`<a href="${this.imgLink}">
                    <img src="${this.imgSrc}"
                        alt="${this.imgAlt}">
                </a>`, {
                    features: {
                        FetchExternalResources: [],
                        ProcessExternalResources: false
                    }
                });
            this.result = h2k.markImages(this.document);
        });

        it('should replace the image', function it() {
            expect(this.document.body.innerHTML)
                .to.be(`(image: ${this.imgSrc} alt: ${this.imgAlt} ` +
                    `link: ${this.imgLink})`);
        });

    });

    describe('Image with a caption', () => {

        before(function before() {
            this.document = jsdom.jsdom(`<figure>
                    <img src="${this.imgSrc}"
                        alt="${this.imgAlt}">
                    <figcaption>${this.imgCaption}</figcaption>
                </figure>`, {
                    features: {
                        FetchExternalResources: [],
                        ProcessExternalResources: false
                    }
                });
            this.result = h2k.markImages(this.document);
        });

        it('should replace the image', function it() {
            expect(this.document.body.innerHTML)
                .to.be(`(image: ${this.imgSrc} alt: ${this.imgAlt} ` +
                    `caption: ${this.imgCaption})`);
        });

    });

});

describe('#markItalic', () => {

    before(function before() {
        this.element = {
            innerHTML: 'lorem ipsum'
        };
        this.document = {
            querySelectorAll: () =>
                [this.element]
        };
        this.result = h2k.markItalic(this.document);
    });

    it('should mark string as italic', function it() {
        expect(this.result).to.be(this.document);
        expect(this.element.innerHTML).to.be('_lorem ipsum_');
    });

});

describe('#markRuler', () => {

    before(function before() {
        this.element = {
            parentNode: {
                replaceChild: sinon.spy()
            }
        };
        this.document = {
            getElementsByTagName: () =>
                [this.element],
            createTextNode: str => str
        };
        this.result = h2k.markRuler(this.document);
    });

    it('should replace the element with the ruler markup', function it() {
        expect(this.result).to.be(this.document);
        expect(this.element.parentNode.replaceChild.calledOnce).to.be.ok();
        expect(this.element.parentNode.replaceChild.args[0][0]).to.be('****');
        expect(this.element.parentNode.replaceChild.args[0][1]).to.be(this.element);
    });

});

describe('#markQuotes', () => {

    before(function before() {
        this.element = {
            innerHTML: 'A fancy quote ...'
        };
        this.document = {
            getElementsByTagName: () =>
                [this.element]
        };
        this.result = h2k.markQuotes(this.document);
    });

    it('should prepend the blockquote symbol', function it() {
        expect(this.result).to.be(this.document);
        expect(this.element.innerHTML).to.be('> A fancy quote ...');
    });

});

describe('#markCodeBlocks', () => {

    before(function before() {
        this.element = {
            innerHTML: 'a code block',
            parentNode: {}
        };
        this.document = {
            querySelectorAll: () =>
                [this.element]
        };
        this.result = h2k.markCodeBlocks(this.document);
    });

    it('should add code fences', function it() {
        expect(this.result).to.be(this.document);
        expect(this.element.parentNode.innerHTML).to.be(`\`\`\`
${this.element.innerHTML}
\`\`\``);
    });

});

describe('#markInlineCode', () => {

    before(function before() {
        this.element = {
            innerHTML: 'an inline-code snippet'
        };
        this.document = {
            getElementsByTagName: () =>
                [this.element]
        };
        this.result = h2k.markInlineCode(this.document);
    });

    it('should add code fences', function it() {
        expect(this.result).to.be(this.document);
        expect(this.element.innerHTML).to.be('`an inline-code snippet`');
    });

});

describe('#markLists', () => {

    describe('Ordered lists', () => {

        before(function before() {
            this.elements = [{
                innerHTML: 'a list item'
            }, {
                innerHTML: 'a second list item'
            }];
            this.list = { children: this.elements };
            this.document = {
                getElementsByTagName: () =>
                    [this.list]
            };
            this.result = h2k.markLists('ol')(this.document);
        });

        it('should add list prefixes', function it() {
            expect(this.result).to.be(this.document);
            expect(this.elements[0].innerHTML).to.be('1. a list item');
            expect(this.elements[1].innerHTML).to.be('2. a second list item');
        });

    });

    describe('Unordered lists', () => {

        before(function before() {
            this.elements = [{
                innerHTML: 'a list item'
            }, {
                innerHTML: 'a second list item'
            }];
            this.list = { children: this.elements };
            this.document = {
                getElementsByTagName: () =>
                    [this.list]
            };
            this.result = h2k.markLists('ul')(this.document);
        });

        it('should add list prefixes', function it() {
            expect(this.elements[0].innerHTML).to.be('- a list item');
            expect(this.elements[1].innerHTML).to.be('- a second list item');
        });

    });

});

describe('#markLinks', () => {

    before(function before() {
        this.text = 'Click me, yo!';
        this.hrefWeb = '/path/to/sub-page.html';
        this.hrefMail = 'mailto:foo@bar.co.uk';
        this.hrefTel = 'tel:+49800123456';
    });

    describe('A basic link', () => {

        before(function before() {
            this.type = 'link';
            this.element = {
                textContent: this.text,
                href: this.hrefWeb,
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                querySelectorAll: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markLinks('', this.type)(this.document);
        });

        it('should add the link element', function it() {
            expect(this.result).to.be(this.document);
            expect(this.document.querySelectorAll.calledOnce).to.be.ok();
            expect(this.document.querySelectorAll.args[0][0]).to.be('a');
            expect(this.element.parentNode.replaceChild.calledOnce).to.be.ok();
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(${this.type}: ${this.hrefWeb} text: ${this.text})`);
            expect(this.element.parentNode.replaceChild.args[0][1])
                .to.be(this.element);
        });

    });

    describe('A target="_blank" link', () => {

        before(function before() {
            this.type = 'link';
            this.element = {
                textContent: this.text,
                href: this.hrefWeb,
                target: '_blank',
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                querySelectorAll: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markLinks('', this.type)(this.document);
        });

        it('should add the link element', function it() {
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(${this.type}: ${this.hrefWeb} text: ${this.text} popup: yes)`);
        });

    });

    describe('A link with title-attribute', () => {

        before(function before() {
            this.type = 'link';
            this.linkTitle = 'A nice title';
            this.element = {
                textContent: this.text,
                href: this.hrefWeb,
                title: this.linkTitle,
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                querySelectorAll: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markLinks('', this.type)(this.document);
        });

        it('should add the link element', function it() {
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(${this.type}: ${this.hrefWeb} text: ${this.text} title: ${this.linkTitle})`);
        });

    });

    describe('A link with title-attribute', () => {

        before(function before() {
            this.type = 'link';
            this.linkClass = 'mega-awesome-link is-fancy';
            this.element = {
                textContent: this.text,
                href: this.hrefWeb,
                className: this.linkClass,
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                querySelectorAll: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markLinks('', this.type)(this.document);
        });

        it('should add the link element', function it() {
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(${this.type}: ${this.hrefWeb} text: ${this.text} ` +
                    `class: ${this.linkClass})`);
        });

    });

    describe('A mailto link', () => {

        before(function before() {
            this.filter = '[href^="mailto"]';
            this.type = 'mail';
            this.element = {
                textContent: this.text,
                href: this.hrefMail,
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                querySelectorAll: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markLinks(this.filter, this.type)(this.document);
        });

        it('should add the link element', function it() {
            expect(this.document.querySelectorAll.args[0][0]).to.be(`a${this.filter}`);
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(${this.type}: ${this.hrefMail.replace('mailto:', '')} text: ${this.text})`);
        });

    });

    describe('A telephone link', () => {

        before(function before() {
            this.filter = '[href^="tel"]';
            this.type = 'tel';
            this.element = {
                textContent: this.text,
                href: this.hrefTel,
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                querySelectorAll: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markLinks(this.filter, this.type)(this.document);
        });

        it('should add the link element', function it() {
            expect(this.document.querySelectorAll.args[0][0]).to.be(`a${this.filter}`);
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(${this.type}: ${this.hrefTel.replace('tel:', '')} text: ${this.text})`);
        });

    });

});

describe('#markVideoEmbeds', () => {

    it('throws on invalid type', () =>
        expect(() => h2k.markVideoEmbeds('myvideo')({})).to.throwError(/^myvideo is not/));

    describe('A basic video', () => {

        before(function before() {
            this.element = {
                src: 'https://youtube.com/v/5ezh65hzb',
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                getElementsByTagName: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markVideoEmbeds('youtube')(this.document);
        });

        it('should add the video element', function it() {
            expect(this.result).to.be(this.document);
            expect(this.element.parentNode.replaceChild.calledOnce).to.be.ok();
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(youtube: ${this.element.src})`);
            expect(this.element.parentNode.replaceChild.args[0][1])
                .to.be(this.element);
        });

    });

    describe('A video width dimensions', () => {

        before(function before() {
            this.width = 800;
            this.height = 500;
            this.element = {
                width: this.width,
                height: this.height,
                src: 'https://youtube.com/v/5ezh65hzb',
                parentNode: { replaceChild: sinon.spy() }
            };
            this.document = {
                getElementsByTagName: sinon.stub().returns([
                    this.element]),
                createTextNode: s => s
            };
            this.result = h2k.markVideoEmbeds('youtube')(this.document);
        });

        it('should add the video element', function it() {
            expect(this.element.parentNode.replaceChild.args[0][0])
                .to.be(`(youtube: ${this.element.src} width: ${this.width} ` +
                    `height: ${this.height})`);
        });

    });

});

describe('#normalizeEmptyLines', () => {

    before(function before() {
        this.text = `lorem


ipsum




dolor.`;
        this.document = {
            body: { textContent: this.text }
        };
        this.result = h2k.normalizeEmptyLines(this.document);
    });

    it('should remove multiple empty lines', function it() {
        expect(this.result).to.be(`lorem

ipsum

dolor.`);
    });

});
