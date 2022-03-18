const path = require('path');
//sketch way to import fetch but fetch is ESM Only Package so this is the only way lmao
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Progress = require("node-fetch-progress");
const extract = require('extract-zip')

//apps executible file in order to execute new commands
var execFile = require('child_process').execFile;

//stop error box
const {app, BrowserWindow, dialog} = require('electron');

// Disable error dialogs by overriding
dialog.showErrorBox = function(title, content) {
    console.log(`${title}\n${content}`);
};

//custom sleep function that we could do await
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const iconPath = "icon/icon.ico";
const {ipcMain} = require('electron');
const {join} = require('path/posix');
let fs = require('fs');

var appData = path.join(app.getPath('appData'),"/HarmoneyData/");
var appLoc = path.join(appData,"/Harmoney/");
var version = path.join(appData,"/ver.json");
var temp = path.join(appData,"/Temp/");
n 
if(!fs.existsSync(appData)) fs.mkdir(appData, (err) => {});
if(!fs.existsSync(appLoc)) fs.mkdir(appLoc, (err) => {});
if(!fs.existsSync(temp)) fs.mkdir(temp, (err) => {});
if(!fs.existsSync(version)) fs.writeFile(version, JSON.stringify(""), (err) => {});

//main func
function createWin(){
    const win = new BrowserWindow({
        width: 450,
        height: 150,
        resizable: true,
        movable: true,
        maximizable: false,
        darkTheme: true,
        devTools: false,
        titleBarStyle: "hidden",
        show: false,
        backgroundColor: '#FFF',
        icon: iconPath,
        title: "Harmoney",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
        }
    });
    console.log("Created Win");
    win.loadFile("main.html");
    win.webContents.once('did-finish-load', function() {
        win.show();
        win.openDevTools();
        win.webContents.send("f");

        //download function for node-fetch, + Download Persentage
        var _persentage = 0;
        var progress;
        async function download(url, folder) {
            win.webContents.send("text","Downloading Harmoney Update");
            const res = await fetch(url);
            progress = new Progress(res, { throttle: 100 })
            progress.on('progress', (p) => {
                _persentage = Math.round((p.done/p.total) * 100);
                _persentage = Math.round(_persentage);
                win.webContents.send("persentage",Math.round(_persentage*0.9));
            });

            await new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(folder);
            res.body.pipe(fileStream);
            res.body.on("error", (err) => {
                reject(err);
            });
            fileStream.on("finish", function() {
                resolve();
            });
            });
        }

        //updater
        //Update Types
        var lfu = Symbol("Looking For Updates");
        var fu = Symbol("Found Updates");
        var nuf = Symbol("No Updates Found");
        var dl = Symbol("Downloading");
        var is = Symbol("Installing");
        var lc = Symbol("Launching");

    //update progress for bar and 
    var UpdateProgress = lfu;

    win.webContents.send("text","Looking For Updates...");

    // link to the repository
    var latestLink = "https://api.github.com/repos/ChezyName/Harmoney/releases/latest";

    //file system API
    const path = require('path');
    let fs = require('fs');

    //different file locations
    var appData = path.join(app.getPath('appData'),"/HarmoneyData/");
    var appLoc = path.join(appData,"/Harmoney/");
    var version = path.join(appData,"/ver.json");
    var temp = path.join(appData,"/Temp/");
    var applicationPath = path.join(appData,"/apppath.json");;

    if(!fs.existsSync(temp)) fs.mkdir(tmp, (err) => {});


    async function launchApplication(){
        UpdateProgress = lc;
        win.webContents.send("text","Launching Harmoney");
        var parameters = [""];

        execFile(executablePath, parameters, function(err, data) {
            console.log(err)
            console.log(data.toString());
            //close app
            app.quit();
       });
    }


    //for progress Bar
    // 90% comes from downloading, 10% from extracting
    async function UpdateApplication(link,ver){
        ver = ver.split("/").pop();
        win.webContents.send("text","Updating To Harmoney " + ver);

        console.log("Updating @ " + link);

        var fileName = link.split("/").pop();
        console.log("B$" + fileName);
        fileName = fileName.substring(0, fileName.lastIndexOf("."));
        console.log("B=A$" + fileName);

        var extention = link.substring(link.lastIndexOf["."]);
        var downloadpath = path.join(temp, "app.zip");
        await download(link,downloadpath);

        if(!fs.existsSync(applicationPath)){
            fs.unlink(applicationPath, (err) => {});
        }

        //save application path to %AppData%
        var aDP = path.join(appLoc,path.join(fileName + "/Harmoney.exe"));
        var applicationDataPath = {
            path: aDP,
        };

        fs.writeFileSync(applicationPath,JSON.stringify(applicationDataPath));
        win.webContents.send("text","Installing...");
        //extract file
        var Extracted = false;
        try {
            await extract(downloadpath, { dir: appLoc })
            console.log('Extraction complete');
            Extracted = true;

            fs.writeFileSync(applicationPath,JSON.stringify(applicationDataPath));

            launchApplication();

            win.webContents.send("persentage",100);
        }
        catch (err) {
            if(!Extracted && err != null && err != undefined) {
                // handle any errors
                console.log('Error Extracting, Retrying...');
                console.log(err);
                
                for(var seconds = 15; seconds > 0; seconds--){
                    win.webContents.send("text","Error Installing, Retrying In " + seconds + "s");
                    await sleep(1000);
                }

                UpdateApplication(link,ver);
            }
        }
    }

    var latestV;
    async function Update(){
        //get the data from GitHub API
        UpdateProgress = lfu;
        fetch(latestLink)
        .then(res => res.json())
        .then((json) => { 
            var downloadLink = json.assets[0].browser_download_url
            var versionLink = json.html_url;
            var linkExt = downloadLink.substring(downloadLink.lastIndexOf["."]);

            //iterate until we get the .zip file
            for(var i = 0; i < json.assets.length; i++) {
                linkExt = downloadLink.substring(downloadLink.lastIndexOf["."]);
                if(linkExt != "zip"){
                    downloadLink = json.assets[i].browser_download_url;
                }
            }

            console.log("-------------------\n");
            console.log(downloadLink);
            console.log("-------------------\n");
            console.log(fs.existsSync(applicationPath));
            if(fs.existsSync(version) == false || !fs.existsSync(appLoc) == false || !fs.existsSync(applicationPath) == false){
                //automaticly force update, file does not exist!
                UpdateProgress = fu;
                console.log("Force Update - No Files Found!!!");
                UpdateApplication(downloadLink,versionLink);
                return;
            }

            let data = JSON.parse(fs.readFileSync(version));
            if(data == null){
                // no version found, force update
                console.log("Data == null, Force Updating!");
                UpdateProgress = fu;
                UpdateApplication(downloadLink,versionLink);
            }
            else{
                //get version from link
                var newData = json;

                //console.log(newData.html_url);
                //remove everything until v0.2
                var currentV = newData.html_url.substring(newData.html_url.lastIndexOf["/"]);
                currentV = currentV.substring(currentV.lastIndexOf["v"]);
                
                var localV = JSON.parse(fs.readFileSync(version));
                //parse to number
                if(currentV == localV.version){
                    console.log("launching Application Becuase Same Ver,");
                    //launch application
                    UpdateProgress = nuf;
                    launchApplication();
                }
                else{
                    console.log("Cant Update, Same Ver Not Detected! --------");
                    console.log("OLD VER: " + localV.version);
                    console.log("NEW VER: " + currentV);
                    UpdateProgress = fu;
                    //save and update version
                    var v = {
                        version: currentV,
                    }
                    fs.writeFileSync(version, JSON.stringify(v), (err) => {});

                    //update application
                    UpdateApplication(downloadLink,versionLink);
                }
            }
        });
    }

    Update();
    });
}

app.whenReady().then(() => {
    createWin();
})

app.on("window-all-closed", () => {
    if(process.platform !== "darwin"){
        app.quit();
    }
});