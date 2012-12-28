module.exports = {
    "NOPO_PARSER": "nopo-node",
    "TARGET_ROOT": "./nopo-node",
    "ADD_PLAIN_EXT": "abc,def",
    "tasks": {
        "task1": {
            "source": "./",
            "target": "./"
        },
        "task2": {
            "cmd": "copy",
            "source": "./",
            "target": "./"
        },
        "task3": {
            "cmd": "copy",
            "source": "./",
            "target": "./"
        }
    },
    groups: 'task1|task3,task2'
}