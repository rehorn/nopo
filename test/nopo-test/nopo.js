module.exports = {
    "NOPO_PARSER": "nopo-node",
    "ADD_PLAIN_EXT": "abc,def",
    "tasks": {
        "task1": {
            "cmd": "copy|compress",
            "source": "./",
            "target": "./",
            "@copy": {
                "test": true
            }
        },
        "task2": {
            "cmd": "copy,compress,concat",
            "source": "./",
            "target": "./"
        },
        "task3": {
            "cmd": "copy",
            "source": "./",
            "target": "./"
        }
    },
    "groups": "task1,task2|task3"
}