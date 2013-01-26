module.exports = {
    "NOPO_PARSER": "nopo-node",
    "TARGET_ROOT": "./nopo_node",
    "tasks": {
        "task1": {
            "cmd": "clean",
            "source": "./nopo_node",
            "target": "./"
        },
        "task2": {
            "source": "**",
            "target": "./"
        },
        "task3": {
            "cmd": "concat",
            "source": "js/*.js",
            "target": "js/node_concat.js"
        },
        "task4": {
            "cmd": "qzmin",
            "source": ["tools/*.qzmin", "tools/tmp/test_qzmin3.qzmin"],
            "target": "./qzmin/"
        },
        "task5": {
            "cmd": "minify",
            "source": ["nopo_node/css/**", "nopo_node/js/**"],
            "target": "./"
        },
        "task6": {
            "cmd": "pack",
            "source": ["nopo_node/**"],
            "target": "./../out.zip",
            "@pack": {
                'basePath': 'nopo_node'
            }
        },
    }
}