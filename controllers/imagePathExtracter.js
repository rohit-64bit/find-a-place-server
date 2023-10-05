const imagePathExtracter = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1];
}

module.exports = imagePathExtracter;