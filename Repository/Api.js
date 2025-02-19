const conf = require('./data/conf.json');
const axios = require('axios');

class Api {
    Axios = axios;
    Conf = conf;
    Token = "";

    App = axios.create({
        baseURL: `${conf.API.URL}${conf.API.ROUTE}`,
        headers: {
            'Authorization': `Bearer ${conf.API.TOKEN}`, 
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

module.exports = new Api();