module.exports = {
    "nopoParser": "nopo-node",
    "tasks": {
        "html": {
            "source": "test.html"
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