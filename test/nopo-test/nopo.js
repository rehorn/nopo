module.exports = {
    "nopoParser": "nopo-node",
    "targetRoot": "./nopo_node",
    "meta": {
        
    },
    "tasks": {
        "task1": {
            "cmd": "clean",
            "source": ["nopo_node", "publsh.zip"]
        },
        "task2": {
            "source": ["**", "!cache.manifest"],
            "target": "./"
        },
        "task21": {
            "source": ["nopo_node/build.bat"],
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
            "target": "./../publish.zip",
            "@pack": {
                "basePath": "nopo_node"
            }
        },
        "task7": {
            "cmd": "replace",
            "source": "./cache.manifest",
            "target": "./app.manifest",
            "@replace": {
                'meta': {
                    'timestamp': '<%= nopo.template.today() %>'
                }
            }
        },
        "task8": {
            "cmd": "optimage",
            "source": "./nopo_node/**"
        },
    }
}