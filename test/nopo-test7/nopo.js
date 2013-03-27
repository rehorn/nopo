module.exports = {
    "tasks": {
        "test1": {
            "source": "*.html",
            "mode": "dev"
        },
        "test2": {
            "source": "css/"
        },
        "test3": {
            "source": "js/",
            "mode": "dev"
        }
    },
    "modes": {
        "dev": "test1,*|test2"
    }
}