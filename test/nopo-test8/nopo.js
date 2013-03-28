module.exports = {
    "tasks": {
        "js-doc-gen": {
            "cmd": "jsdoc",
            "source": "js/",
            "target": "js-doc/",
            "@jsdoc": {
                "conf": "tools/jet-doc-config.conf"
            }
        }
    }
}