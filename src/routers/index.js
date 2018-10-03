class Routers {
    constructor(node) {
        this.node = node;
        this.routers = {};
    }

    get(router) {
        if(!router.match(/^[0-9a-z]+$/))
            throw new Error("Router must be alphanumeric!");
        let r = this.routers[router];
        if(!r)
            throw new Error("Router not found on node!");
        return r;
    }

    use(name, handler) {
        if(this.routers[name])
            throw new Error(`Router with name ${name} already registered!`);
        this.routers[name] = handler;
    }
}

module.exports = Routers;