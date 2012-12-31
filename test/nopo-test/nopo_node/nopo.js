module.exports = {
    "NOPO_PARSER": "nopo-node",
    "TARGET_ROOT": "./nopo_node",
    "tasks": {
        "task1": {
            "cmd": "remove",
            "source": "./nopo_node",
            "target": "./"
        },
        "task2": {
            "source": "*",
            "target": "./"
        },
        "task3": {
            "cmd": "concat",
            "source": "js/*.js",
            "target": "./node_concat.js"
        },
    }
}