module.exports = {
    "tasks": {
        "manifest":{
            "cmd": "manifest",
            "source": "*.html",
            "@manifest": {
                "linkPrefix": "http://cdn.qplus.com/qplus/",//optional
                "manifestSuffix": "manifest", // optional
                "network": [ "*" ],//optional
                "fallback": [ // optional
                    "/ fallback.html"
                ]
            }
        }
    }
}