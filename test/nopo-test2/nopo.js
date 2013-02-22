module.exports = {
    "nopoParser": "nopo-node",
    "tasks": {
        "deploy":{
            "cmd": "deploy",
            "source": "**",
            "target": "/htdocs/",
            "@deploy": {
                "type": "ftp",
                "host": "223.7.143.233​",
                "port": "21",
                "user": "hmu046233",
                "password": "member99"
            }
        }
    }
}