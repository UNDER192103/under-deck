const axios = require('axios');

class Api {
    Axios = axios;
    Token = "";

    App = axios.create({
        baseURL: `${process.env.API_URL}${process.env.API_ROUTE}`,
        headers: {
            'Authorization': `Bearer ${process.env.API_TOKEN}`, 
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    Cloud = axios.create({
        baseURL: `${process.env.CLOUD_URL}${process.env.CLOUD_ROUTE}`,
        headers: {
            'Authorization': `Bearer ${process.env.CLOUD_TOKEN}`, 
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

module.exports = new Api();