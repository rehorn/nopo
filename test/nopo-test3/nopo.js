module.exports = {
    "nopoParser": "nopo-node",
    "tasks": {
        "html": {
            "source": "index.html"
        },
        "sprite":{
            "cmd": "sprite",
            "source": "css/",
            "@sprite": {
                'imgRoot': "img/"
            }
        }
    }
}