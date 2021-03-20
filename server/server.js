const express = require('express');
const path = require('path');
const rootDir = require('../project.config').APP_ROOT
const app = express();

app.use(express.static(rootDir + '/dist/popup')); 
app.get('/*', function (req, res) {
    res.sendFile(path.join(rootDir  + '/dist/popup' + req.path ));
    console.log(req.path);
});
app.listen(3000, () => {
    console.log(path.join(rootDir + '/dist/popup/schedule.html'))
    console.log("Starting web server in port: " + 3000)
});
