
module.exports = htmlString => {
    try {
        return (new DOMParser()).parseFromString(htmlString, 'text/html');
    } catch (e) {
        const doc = document.implementation.createHTMLDocument('');
        doc.body.innerHTML = htmlString;
        return doc;
    }
};
