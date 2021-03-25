const path = require('path');
const fs = require('fs');
const config = require('./project.config.js');

var pathsToKeepArr = config.KEEP_FILES;
var filesToMoveArr = config.MOVE_FILES;
var BUILD_DIR = config.BUILD_DIR || showError("BUILD_DIR not specified");
var APP_ROOT = config.APP_ROOT;

function showError(error){
    console.log("Error in postScript: " + error);
    process.exit(1);
}

function contains(array, name){
    for (let path of array){
        if (path === name){
            return true;
        }
    }
    return false;
}

function deleteF(dir){
    fs.readdirSync(dir, {withFileTypes:true}).forEach(entry=>{
        let element = path.join(dir, entry.name);
        if (!contains(pathsToKeepArr, element)){
            if (entry.isFile()){
                fs.rmSync(element);
            }else if (entry.isDirectory()){
                deleteF(element)
                //Delete dir if empty
                try{
                    fs.rmdirSync(element, {recursive:false});
                }catch(e){}
            }
        }
    })
}

(()=>{
    
    pathsToKeepArr = pathsToKeepArr.map(aPath=>path.join(APP_ROOT, aPath.split(path.sep).join(path.posix.sep)));

    if (process.env.BUILD_MODE !== 'production' && process.env.BUILD_MODE !== 'development'){
        //Fail if the env is not set
        showError("Error, BUILD_MODE has incorrect value: " + process.env.BUILD_MODE)
    }
    
    if (process.env.BUILD_MODE === 'development'){
        filesToMoveArr.concat(config.MOVE_FILES_DEV);
    }
    
    if (process.env.CLEAR_DIST == "true"){
        try{
            deleteF(path.join(APP_ROOT, BUILD_DIR));
        }catch(e){
            showError(e);
        }
    }
    
    filesToMoveArr.forEach(async entry=>{
        //Copy the file if it doesnt exist
        let src = path.join(APP_ROOT, entry[0]);
        let dest = path.join(APP_ROOT, BUILD_DIR, entry[1], path.basename(src));
        try{
            fs.accessSync(dest, fs.F_OK);
        }catch(e){
            fs.mkdirSync(path.join(APP_ROOT, BUILD_DIR, entry[1]), {recursive:true});
            fs.copyFileSync(src, dest, fs.COPYFILE_EXCL, showError)
        }
    })

    console.log("Post Build finished successfully!");
})()