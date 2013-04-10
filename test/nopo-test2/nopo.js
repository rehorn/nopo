module.exports = {
    "nopoParser": "nopo-node",
    "tasks": {
        "deploy":{
            "cmd": "deploy",
            "source": "**",
            "target": "/htdocs/",
            "@deploy": {
                "host": "***",
                "port": "21",
                "user": "***",
                "password": "***"
            }
        }
    }
}