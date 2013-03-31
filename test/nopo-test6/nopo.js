module.exports = {
    "tasks": {
        "enhancecss":{
            "cmd": "css",
            "source": "css/",
            "@css": {
                "stamp": "md5", // mtime, md5
                // "assetHosts": "http://qplus[0,1,2,3,4,5,6,7,8,9].idqqimg.com/pub/",
                "rev": 1,
                "dataUri": 1,
                "exclude": ["img/test3.png"],
                "skipDuplicate": 1
            }
        },
        // "htmlrefs": {
        //     "cmd": "htmlrefs",
        //     "source": "*.html",
        //     "@htmlrefs": {
        //         "tmpl2js": "tools/tmpl2js.js",
        //         "h5Timing": "tools/h5-timing.html",
        //         "googleAnalytics": "tools/google-analytics.html"
        //     }
        // }
    }
}