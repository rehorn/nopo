module.exports = {
    "tasks": {
        "enhancecss":{
            "cmd": "css",
            "source": "css/",
            "@css": {
                "stamp": 1,
                "cryptedStamp": 1,
                "assetHosts": "http://qplus[0,1,2,3,4,5,6,7,8,9].idqqimg.com/pub/",
                "rev": 1,
                "dataUri": 1,
                "exclude": ["img/test3.png"],
                "skipDuplicate": 1
            }
        }
    }
}