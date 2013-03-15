module.exports = {
    "nopoParser": "nopo-node",
    "tasks": {
        "sprite":{
            "cmd": "sprite",
            "source": "css/",
            "target": "build/",
            "@sprite": {
                'imgRoot': "css/"
            }
        }
    }
}