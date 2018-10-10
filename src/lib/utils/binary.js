const BSON = require('bson');
const bson = new BSON();

module.exports = {
    serialize: (data) => {
        return bson.serialize(data);
    },
    deserialize: (data) => {
        return bson.deserialize(data);
    }
};