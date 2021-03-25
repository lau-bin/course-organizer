module.exports = {
    APP_ROOT: __dirname, //Current dir full path in node
    BUILD_DIR: "dist",
    KEEP_FILES: [
        "dist/popup/schedule.html",
        "dist/manifest.json",
        "dist/popup/bootstrap.css"
    ],
    MOVE_FILES: [
        ["resources/bootstrap/bootstrap.css","popup"],
        ["src/schedule.html", "popup"],
        ["src/manifest.json", ""]
    ],
    MOVE_FILES_DEV:[
        ["resources/bootstrap/bootstrap.css.map","popup"]
    ]
}