module.exports = {
    getRouter: (router) => {
        if(!router.match(/^[0-9a-z]+$/))
            throw new Error("Router must be alphanumeric!");
        let r = require(`./${router}/index.js`);
        if(!r)
            throw new Error("Router not found on node!");
        return r;
    }
};