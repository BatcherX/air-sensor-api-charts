const PROXY_CONFIG = {
   "/api": {
        "target": "http://ce16110:4200/",
        "secure": false,
        "bypass": function (req, res, proxyOptions) {
            req.headers["X-Forwarded-For"] = req.ip;
        }
    }
}

module.exports = PROXY_CONFIG;