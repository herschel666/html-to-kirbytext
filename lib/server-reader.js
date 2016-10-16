
const jsdom = require('jsdom');

module.exports = htmlString =>
    jsdom.jsdom(htmlString, {
        features: {
            FetchExternalResources: [],
            ProcessExternalResources: false
        }
    });
