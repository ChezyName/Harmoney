// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const ProgressBar = require('electron-progressbar');

//last call will be removed login out, closing the app, or making a new call
var lastMadeCall = null;
var wasAnswer = false;

const firebase = require('firebase')
require("firebase/auth");
require("firebase/storage");
require("firebase/firestore")
const uuidv1 = require("uuidv1");

const firebaseConfig = {
    // CANT SHOW THESE LMAO
};

var currentUser;
var userName = "";
var userIcon = "";
var UserData = {
    name: "",
    uid: "",
    pic: "",
    friends: [],
    frequests: [],
    chats: [],
}

firebase.initializeApp(firebaseConfig);
const Auth = firebase.auth();
const store = firebase.storage().ref();
const db = firebase.firestore();

let allUsers = db.collection('allUsers');
let allCalls = db.collection('allCalls');

// class for all data and setings to be held in once filename
class HarmoneySettings {
    constructor() {
        this.Theme = "Dark";
        this.Width = 740;
        this.Height = 360;
    }
}

const path = require('path');
const iconPath = "icon/icon.ico";
const {app, BrowserWindow, dialog} = require('electron');
const {ipcMain} = require('electron');
const {join} = require('path/posix');
let fs = require('fs');
const { Z_ASCII } = require('zlib');

var Settings = new HarmoneySettings();

var Appdata = path.join(app.getPath('appData'),"/HarmoneyData/");
console.log(Appdata);
var filename = path.join(Appdata, "harmoneyData.data");
var userpass = path.join(Appdata, "login.data");
var tmp = path.join(Appdata, "/temp/");

var epassD = {
    Email: "",
    Pass: "",
}

//make the files if they dont exist
if(!fs.existsSync(Appdata)) fs.mkdir(Appdata, (err) => {});
if(!fs.existsSync(tmp)) fs.mkdir(tmp, (err) => {});

if(!fs.existsSync(filename)) fs.writeFile(filename, "", (err) => {});
if(!fs.existsSync(userpass)) fs.writeFile(userpass, JSON.stringify(epassD), (err) => {});

// all variables for the browser window instances
var Set = null;
var loginWin = null;
var win = null;
var fwin = null;

//gets the users data and returns it back to via a promise.
function getUserData(UserId) {
    return new Promise((resolve) => {
        if(UserId == null || UserId == undefined || UserId == "") resolve(null);
        console.log("UID =>" + UserId + "-END");
        allUsers.doc(UserId).get()
        .then((doc) => {
            if (doc.exists) {
                //console.log(doc.data());
                console.log("Returning Document");
                resolve(doc.data());
            } else {
                console.log("DocIsNonExsistent!");
                resolve(null);
            }
        })
        .catch((err) => {
            console.log(err);
            resolve(null);
        });
    })
}

//same as above but instead, it writes the data to firebase.
function writeUserData(UserId, data) {
    return new Promise((resolve) => {
        var databasedoc = allUsers.doc(UserId)
        //console.log("==========================================================");
        //console.log(UserId);
        //console.log("==============");
        //console.log(data);
        //console.log("==========================================================");
        databasedoc.set(data, {merge: true})
        .then(_ => {
            //console.log('Saved Data Good :D');
            resolve();
        })
        .catch(err => {
            //console.log("error wriritng to doc: " + err);
            resolve();
        });
    });
}

var hasGoodbyed = false;

function playSound(linkToSound){
    console.log("Checking If Playing Sound Or Naw")
    if(win == undefined || win == null) return;
    console.log("Playing Sound To The WEB Client!");
    //play the sound on the MAIN process
    win.webContents.send("PlaySound",path.resolve("sounds/" + linkToSound));
}

var creatingMain = false;
async function createMain() {
    // closing if already opened
    if(win != null){
        win.show();
        return;
    }
    
    if(creatingMain == true) return;
    if (!app.requestSingleInstanceLock()) {
        app.quit();
    }
    let oldWin = win;
    creatingMain = true;
    //gets all data before loading new window
    var newWin = new BrowserWindow({
        width: Settings.Width, // 740
        height: Settings.Height, // 360
        resizable: true,
        movable: true,
        maximizable: false,
        darkTheme: true,
        devTools: true,
        titleBarStyle: "hidden",
        show: false,
        backgroundColor: '#FFF',
        minWidth: 540,
        minHeight: 360,
        icon: iconPath,
        title: "Harmoney",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    newWin.loadFile('src/html/main.html')

    async function fullyClose(){
        playSound('Goodbye.mp3');
        console.log("Closing... => " + lastMadeCall);
        if(lastMadeCall != null && lastMadeCall != undefined){
            console.log("removing From Firebase")
            //remove the call off of firebase

            var usersDoc = allUsers.doc(lastMadeCall)
            usersDoc.get().then((document) => {
                var data = document.data();
                console.log(data.uid);
                var calls = data.calls;

                /*
                if(wasAnswer == true){
                    for(var i = 0; calls.length; i++){
                        if(calls[i].answeruid == currentUser.uid){
                            calls[i].answer = {};
                            break;
                        }
                    }
                }
                else{
                    for(var i = 0; calls.length; i++){
                        if(calls[i].uid == currentUser.uid){
                            calls.splice(i, 1);
                            break;
                        }
                    }
                }
                */

                calls = [];

                data.calls = calls;
                usersDoc.set(data, {merge: true})
                .then(_ => {
                    console.log("removed! closing the app soon...");
                    
                    if (process.platform !== 'darwin') {
                        console.log("bye bye...");
                        lastMadeCall = null;
                        playBye();
                    }
                });
            })

            console.log("Why Skipped?");
        }
        else{
            if (process.platform !== 'darwin') {
                console.log("bye bye...");
                playBye();
            }
        }
    }

    newWin.webContents.once('did-finish-load', function() {
        creatingMain = false;
        loginWin.close();
        //win.show();
        //if(win != null) win.close();
        win = newWin;
        getAllFriends();
        win.openDevTools();
        let getT = async function() {
            if (fs.existsSync(filename)) {
                //File Exits
                fs.readFile(filename, 'utf-8', (err, data) => {
                    if (err) {
                        alert("An error ocurred reading the file :" + err.message);
                        return;
                    }
                    // Change how to handle the file content
                    //console.log(data);
                    try {
                        Settings = JSON.parse(data);
                        //console.log("Completed To JSON!");
                    } catch (e) {
                        Settings = new HarmoneySettings();
                        saveTheme();
                    }
                });
            }
            return Settings;
        }
        getT().then((value) => {
            //win.openDevTools();
            win.setSize(Settings.Width, Settings.Height);
            //welcome to harmoney SFX
            playSound('WELCOME.mp3');

            //send the UID to the webRTC Client
            console.log();
            console.log("UID -> :=: == " + currentUser.uid);
            console.log();

            win.webContents.send("SentUsername", {name: userName, uid: currentUser.uid});
            win.show();
            setTheme();
            if (loginWin != null) loginWin.close();
        })

        win.on('close', e => { // Line 49
            if(lastMadeCall == null || lastMadeCall == undefined)
            {
                if(hasGoodbyed){
                    app.quit();
                }
                else{
                    e.preventDefault()
                    //1.262s
                    e.preventDefault()
                    playSound('Goodbye.mp3');
                    setTimeout(() =>{
                        hasGoodbyed = true;
                        app.quit();
                    },1262)
                }
            }
            else{
                e.preventDefault()
                fullyClose();
            }
        });
        
        //save every time window size was changed
        win.on('resize', function() {
            var size = win.getSize();
            Settings.Width = size[0];
            Settings.Height = size[1];
            saveTheme();
        });
        win.on("closed", e => {
            e.preventDefault()
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null;
        });
    });
    app.on("window-all-closed", e => {
        if(win != null || fwin != null || loginWin != null) return;
        try{
            e.preventDefault()
            fullyClose();
        }
        catch{
            if(hasGoodbyed){
                app.quit();
            }
            else{
                e.preventDefault()
                //1.262s
                e.preventDefault()
                playSound('Goodbye.mp3');
                setTimeout(() =>{
                    hasGoodbyed = true;
                    app.quit();
                },1262)
            }
        }
    });
}
var closing = false;
//IPC Events
ipcMain.on("close", (e, args) => {
    if(closing) return;
    closing = true;

    if(hasGoodbyed){
        app.quit();
    }
    else{
        e.preventDefault()
        //1.262s
        e.preventDefault()
        playSound('Goodbye.mp3');
        setTimeout(() =>{
            hasGoodbyed = true;
            app.quit();
        },1262)
    }
});
ipcMain.on("msg", (event, args) => {
    showMessage("ERROR", args);
})
ipcMain.on("min", (event, args) => {
    win.minimize();
});
ipcMain.on("settings", (event, args) => {
    if (Set != null) {
        Set.close();
        return;
    }
    SettingsMenu();
});
ipcMain.on("closesettings", _ => {
    if (Set != null) {
        Set.close();
    }
});
ipcMain.on("ChangeTheme", (event, args) => {
    //console.log("Changed Theme To " + args);
    Settings.Theme = args;
    saveTheme();
    win.webContents.send("ThemeChanged", Settings.Theme);
});
ipcMain.on("GetTheme", (event, args) => {
    setTheme();
});
ipcMain.on("GetUsername", _ => {
    win.webcontents.send("SentUsername", username);
});

function setTheme() {
    var file = path.join(__dirname, `Themes/${Settings.Theme}.css`);
    //console.log(file);
    //console.log(fs.existsSync(path.join(file)));
    if (!fs.existsSync(filename) || Settings.Theme == "Dark") {
        //console.log(path.join(__dirname,"src/css/Themes/Dark.css"));
        win.webContents.send("MainChanged",
            path.join(__dirname, "src/css/Themes/Dark.css"), "Dark");
        if (Set != null) {
            Set.webContents.send("MainChanged",
                path.join(__dirname, "src/css/Themes/Dark.css"), "Dark");
        }
        if (fwin != null) {
            fwin.webContents.send("MainChanged",
                path.join(__dirname, "src/css/Themes/Dark.css"), "Dark");
        }
    } else {
        //console.log(file);
        win.webContents.send("MainChanged", file);
        if (Set != null) {
            Set.webContents.send("MainChanged", file, Settings.Theme);
        }
        if (fwin != null) {
            fwin.webContents.send("MainChanged", file);
        }
    }
}

function SettingsMenu() {
    Set = new BrowserWindow({
        width: 300,
        height: 400,
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
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    Set.loadFile('src/html/settings.html')
    Set.webContents.once('did-finish-load', function() {
        //Set.openDevTools();
        Set.show();
        setTheme();
    });
    Set.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        Set = null;
    });
}
async function loadTheme() {
    //Check if file exists
    if (fs.existsSync(filename)) {
        //File Exits
        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            // Change how to handle the file content
            //console.log(data);
            try {
                Settings = JSON.parse(data);
                //console.log("Completed To JSON!");
            } catch (e) {
                Settings = new HarmoneySettings();
                saveTheme();
            }
        });
    } else {
        Settings = new HarmoneySettings();
        saveTheme();
    }
    if (Settings.Theme == null) {
        //set theme to basic dark theme
        Settings.Theme = path.join(__dirname, 'src/css/Themes/Dark.css');
        saveTheme();
    }
}

function saveTheme(callback) {
    var s = JSON.stringify(Settings, null, 2);
    ////console.log(s);
    fs.writeFile(filename, s, (err) => {
        if (callback != null) {
            callback();
        }
    })
}
loadTheme();

function showMessage(title, message) {
    dialog.showErrorBox(title, message);
}
var eml;
var pss;
// login state
async function createLogin() {
    loginWin = new BrowserWindow({
        width: 250,
        height: 400,
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
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    loginWin.loadFile('src/html/connectionError.html');
    loginWin.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        loginWin = null;
    });
    loginWin.webContents.once('did-finish-load', function() {
        loginWin.openDevTools();

        loginWin.show();
        console.log("n WebCont");
        const dns = require('dns');
        let findConnection = function(){
            console.log("n find FuncCOn");
            return new Promise(resolve => {
                dns.resolve('www.google.com', function(err) {
                    if (err) {
                       console.log("No connection");
                       resolve(false);
                    } else {
                       console.log("Connected");
                       resolve(true);
                    }
                });
            });
        }

        let complete = function(){
            console.log("n Complete");
            //loginWin.openDevTools();
            autoLogin();
            loginWin.show();
            if (win != null) win.hide();
            if (Set != null) {
                Set.close();
            }
        }
    
        // retry connections
        let retryConn = async function(){
            console.log("n Retry");
            var res = await findConnection();
            if(res == true){
                complete();
            }
            else{
                //2.5s = 2500ms
                
                //commented out, causes loading ring gif to reset
                //loginWin.loadFile('src/html/connectionError.html');
                setTimeout(retryConn,2500);
            }
        }

        retryConn();
    });
}
var trying = false;
ipcMain.on("register", (event, args) => {
    ////console.log("R: " + args.Email + " : " + args.Pass);
    if(trying == true) return;
    eml = args.Email;
    pss = args.Pass;
    tryRegister(args.Email, args.Pass);
});
ipcMain.on("login", (event, args) => {
    ////console.log("LO]IN: " + args.Email + " : " + args.Pass);
    if(trying == true) return;
    eml = args.Email;
    pss = args.Pass;
    if (eml == null || pss == null) {
        loginWin.webContents.send("resetInput");
        showMessage("ERROR", "EMAIL or PASSWORD was 'undefined', please try again.");
        return;
    }
    tryLogin(args);
});
ipcMain.on("addUser", (event, args) => {
    var usr = args.UserName.toLowerCase();;
    ////console.log(currentUser);
    if (currentUser != null) {
        if (usr != null && usr != "") {
            // update userName
            userName = args.UserName.toLowerCase();;
        }
        //save Profile Picture
        //savePFP(usr);
        onFinishLogin(currentUser, eml, pss);
    } else {
        showMessage("ERROR", "Could Not Find Account, Retry Login.");
        loginWin.loadFile('src/html/login.html');
    }
})

ipcMain.on("changeIcon", _ => {
    createLogin();
});
ipcMain.on("signOut", _ => {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        if (win != null) win.hide();
        if (fwin != null) fwin.hide();
        if (loginWin != null) loginWin.close();
        if (Set != null) Set.close();
        currentUser = null;
        fs.unlinkSync(userpass);
        //remove the autoLoginfile
        if(lastMadeCall != null && lastMadeCall != undefined){
            console.log("Closing... => " + lastMadeCall);
            if(lastMadeCall != null && lastMadeCall != undefined){
                console.log("removing From Firebase")
                //remove the call off of firebase
    
                var usersDoc = allUsers.doc(lastMadeCall)
                usersDoc.get().then((document) => {
                    var data = document.data();
                    console.log(data.uid);
                    var calls = data.calls;

                    if(wasAnswer == true){
                        for(var i = 0; calls.length; i++){
                            if(calls[i].answeruid == currentUser.uid){
                                calls[i].answer = {};
                                break;
                            }
                        }
                    }
                    else{
                        for(var i = 0; calls.length; i++){
                            if(calls[i].uid == currentUser.uid){
                                calls.splice(i, 1);
                                break;
                            }
                        }
                    }

                    data.calls = calls;
                    usersDoc.set(data, {merge: true})
                    .then(_ => {
                        console.log("removed! closing the app soon...");
                        createLogin();
                    });
                })
    
                console.log("Why Skipped?");
            }
            else{
                createLogin();
            }
        }
        else{
            createLogin();
        }
    }).catch((error) => {
        // An error happened.
    });
});

var fileName;
var pfpFile;
var extention = "";

ipcMain.on("GetIcon", _ => {
    //console.log("Creating New User-Img");
    dialog.showOpenDialog(loginWin, {
        filters: [{
                name: 'Images',
                extensions: ['png', "jpeg", "gif"]
            },
            {
                name: 'All Files',
                extensions: ['*']
            }
        ],
        properties: ['openFile'],
    })
    .then(result => {
        //console.log("GOT: " + result.filePaths[0]);
        loginWin.webContents.send("onIcon", result.filePaths);
        fs.readFile(result.filePaths[0], (err, data) => {
            if (err) {
                alert("An error ocurred reading the file :" + err.message);
                return;
            }
            // Change how to handle the file content
            extention = path.extname(result.filePaths[0]);
            extention = extention.split('.').join("");
            pfpFile = data;
            fileName = path.basename(result.filePaths[0]);
        });
        return;
    });
})

// set Basic icon var
var basicIconLink = "";
//get the basic icon from the storage bucket
store.child("ProfilePics/UserBasicIcon.png").getDownloadURL()
.then((url) => {
    basicIconLink = url;
})
.catch((err) => {
    //cant find so we dont do anything...
    basicIconLink = "";
});

// save profile picture to firebase storage
async function savePFP(name) {
    if (pfpFile == null || pfpFile == "") {
        //use basic profile picture
        UserData.name = this.name;
        currentUser.updateProfile({
            displayName: name,
            photoURL: basicIconLink,
        }).then(() => {
            // Update successful
            // send the photo to the register Window
            loginWin.webContents.send("onIcon", basicIconLink);
            userName = name.toLowerCase();;
            onFinishLogin(currentUser, eml, pss);
        }).catch((error) => {
            // An error occurred
            // out the error to the user
            showMessage("ERROR", error.message);
        });
        return;
    }

    loginWin.hide();
    var bar = new ProgressBar({
        title: "Uploading Items",
        text: "Uploading: " + fileName,
        detail: "Prepairing File Transfer...",
        initialValue: 0,
        maxValue: 100,
        closeOnComplete: true,
    })
    .on('completed', _ => {
        bar.detail = "Upload Complete";
    });

    ////console.log("Saving Image To DB: " + pfpFile);

    var UID = currentUser.uid;
    var pfpRef = store.child("ProfilePics/" + UID + ":" + "ProfilePic" + "." + extention);
    // check if file exits if it does remove it and reupload new one [SAVE STORAGE]

    store.getDownloadURL()
    .then((response) => {
        pfpRef.delete().then(() => {
            // File deleted successfully
        }).catch((error) => {
            // Uh-oh, an error occurred!
            // could not find, continue normally
            var metaData = {
                contentType: "image/" + extention,
            };
            //save file to Firebase Storage
            var uploadTask = pfpRef.put(pfpFile, metaData);
            uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total
                //number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                bar.value = progress;
                bar.detail = "Uploaded " + snapshot.bytesTransferred + " Bytes Out Of " +
                    snapshot.totalBytes + " Total Bytes.";
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        //console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        //console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // Handle unsuccessful uploads
                // debug and open back up
                showMessage("ERROR", "Unsuccessfull Upload 'Profile Picture' To The Cloud,Please Try Again.")
                        loginWin.show();
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL:
                        //https:firebasestorage.googleapis.com/...
                        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            //console.log('File available at', downloadURL);
                            bar.setCompleted();
                            bar.close();
                            UserData.name = this.name;
                            UserData.pic = this.downloadURL;
                            //update the users profile with thier photo and thier new name
                            currentUser.updateProfile({
                                displayName: name,
                                photoURL: downloadURL,
                            }).then(() => {
                                // Update successful
                                // send the photo to the register Window
                                loginWin.webContents.send("onIcon", downloadURL);
                                userName = name.toLowerCase();;
                                onFinishLogin(currentUser, eml, pss);
                            }).catch((error) => {
                                // An error occurred
                                // out the error to the user
                                showMessage("ERROR", error.message);
                            });
                            // create message collection
                        });
                    }
                );
            });
    })
    .catch((err) => {
        // could not find, continue normally
        var metaData = {
            contentType: "image/" + extention,
        };
        //save file to Firebase Storage
        var uploadTask = pfpRef.put(pfpFile, metaData);
        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total
                // number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                bar.value = progress;
                bar.detail = "Uploaded " + snapshot.bytesTransferred + " Bytes Out Of " +
                    snapshot.totalBytes + " Total Bytes.";
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        //console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        //console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // Handle unsuccessful uploads
                // debug and open back up
                showMessage("ERROR", "Unsuccessfull Upload 'Profile Picture' To The Cloud,Please Try Again.")
                loginWin.show();
            },
            () => {
                // Handle successful uploads on complete
                // For instance, get the download URL:
                //https:firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    //console.log('File available at', downloadURL);
                    bar.setCompleted();
                    bar.close();
                    //writeUserData(currentUser.uid,"name",name);
                    //writeUserData(currentUser.uid,"icon",downloadURL);
                    //writeUserData(currentUser.uid,"friends",[{}]);
                    //update the users profile with thier photo and thier new name
                    UserData.name = this.name;
                    UserData.pic = downloadURL;
                    currentUser.updateProfile({
                        displayName: name,
                        photoURL: downloadURL,
                    }).then(() => {
                        // Update successful
                        // send the photo to the register Window
                        loginWin.webContents.send("onIcon", downloadURL);
                        userName = name.toLowerCase();;
                        onFinishLogin(currentUser, eml, pss);
                    }).catch((error) => {
                        // An error occurred
                        // out the error to the user
                        showMessage("ERROR", error.message);
                    });
                    // create message collection
                });
            }
        );
    });
}

// automaticly login when the application is started
async function autoLogin() {
    if (fwin != null) fwin.hide();
    if (win != null) win.hide();
    if (Set != null) {
        Set.close();
    };
    try {
        fs.readFile(userpass, (err, data) => {
            if (err || data == null || data == undefined) {
                console.log("No Data In File!")
                loginWin.loadFile("src/html/login.html");
                return;
            }

            // automaticly login
            var d = { Email: "", Pass: "",}
            try{
                d = JSON.parse(data);
                //console.log("E: " + d.Email, + "P: " + d.Pass);
                if (d.Email == null || d.Pass == null) {
                    console.log("Null Email and/or Password")
                    loginWin.loadFile("src/html/login.html");
                    return;
                }
                Auth.signInWithEmailAndPassword(d.Email, d.Pass)
                .then((u) => {
                    // Signed in
                    currentUser = u.user;
                    //console.log('U: ' + currentUser.uid);
                    console.log("Auto Logged In :D")
                    onFinishLogin(currentUser, d.Email, d.Pass);
                })
                .catch((error) => {
                    //console.log(error + " Making Login");
                    console.log("=========== ERROR ===========")
                    console.log(error);
                    loginWin.loadFile("src/html/login.html");
                });
            }
            catch{
                console.log("? Error")
                loginWin.loadFile("src/html/login.html");
            }
        });
    } catch {
        // file does not exist
        console.log("File No Bueno")
        loginWin.loadFile("src/html/login.html");
    }
}

// FIRE BASE LOGING-IN
function tryLogin(d) {
    //console.log("Trying To [X] Using " + d.Email + " With " + d.Pass);
    // return true or false based on if login was successful
    trying = true;
    Auth.signInWithEmailAndPassword(d.Email, d.Pass)
    .then((u) => {
        // Signed in
        currentUser = u.user;
        //console.log('U: ' + currentUser.uid);
        if (currentUser == null) {
            showMessage("ERROR", "Cant Login, Unknown Error, Try Checking WifiSettings.");
            return;
        }
        eml = d.Email;
        pss = d.Pass;
        onFinishLogin(currentUser, d.Email, d.Pass);
    })
    .catch((error) => {
        if(loginWin != null && loginWin != undefined){
            loginWin.webContents.send("resetInput");
        }
        showMessage("ERROR", error.message);
        trying = false;
    });
}
// FIRE BASE REGISTER
function tryRegister(email, pass) {
    //console.log("AUTH STATUS: " + Auth);
    //console.log("Trying To Register Using " + email + " With " + pass);
    trying = true;
    Auth.createUserWithEmailAndPassword(email, pass)
    .then((u) => {
        //register success
        currentUser = u.user;
        //console.log(u.user);
        // load new page to let user
        // add username + icon
        // Reset Theme
        loginWin.loadFile('src/html/completeregister.html');
        Settings = new Settings();
        saveTheme();
    })
    .catch((error) => {
        //register failed
        if (error.code != null) {
            //console.log(error.code);
            const errorCode = error.code;
            const errorMessage = error.message;
            loginWin.webContents.send("resetInput");
            showMessage(errorCode, errorMessage);
        }
        trying = false;
    })
}
//class to save and load user information
class userData {
    constructor() {
        this.Email = "";
        this.Pass = "";
    }
}
ipcMain.on("GetPP", _ => {
    if (userIcon == null) {
        //console.log("Returning Basic Icon");
        loginWin.webContents.send("onIcon", basicIconLink);
        return;
    }
    loginWin.webContents.send("onIcon", userIcon);
    //console.log("Returning Useres Icon: " + userIcon);
});

var userUpdater;
var messageUpdater;

//function to fully login user and alow them to
// use the full app and save email+password
function onFinishLogin(user, email, pass) {
    //loginWin.webContents.send("resetInput");
    trying = false;
    var d = new userData();
    d.Email = email;
    d.Pass = pass;
    var toJ = JSON.stringify(d);
    // write all data to players file with UserData
    currentUser = user;
    //get current friends + fRequests and all data before overrideing
    
    //update the users
    userUpdater = allUsers.doc(currentUser.uid).onSnapshot({},(doc) => {
        //update friend requests
        updateFR(doc.data());
        getAllFriendsWithDoc(doc.data());
        checkForCalls(doc.data());
    });

    messageUpdater = allMsgs.onSnapshot({}, (snapshot) => {
        snapshot.forEach((doc) => {
            if(doc.exists){
                console.log(doc.exists + "/" + doc.id);
                var docName = doc.id;
                if(docName.includes(currentUser.uid)){
                    //play sfx
                    playSound('HarmoneyNotificationSFX.mp3');
                }
            }
        });
    })

    getUserData(currentUser.uid).then((data) => {
        UserData = data;
        currentUser.photoURL = data.pic;
        userName = currentUser.displayName.toLowerCase();;
        UserData.uid = user.uid;
        UserData.name = userName.toLowerCase();;
        if (userIcon != null || userIcon != "src/UserBasicIcon.png") {
            UserData.pic = userIcon;
        }
        //console.log(UserData);
        writeUserData(user.uid, UserData).then();
        createMain();
        fs.writeFile(userpass, toJ, (err) => {
            console.log("ERRRRRRRRRRRRRRR   Saving Username & Password");
        });
    })
}
// when the app is ready create the login prompt
app.whenReady().then(() => {
    getUpdatesAndStart();
})

async function getUpdatesAndStart(){
    // try auto login
    createLogin();
}
//Messaging Features
var fwinwas = false; ipcMain.on("closeFriends", _ => {
    fwin.hide();
    win.show();
    fwinwas = false;
});

function friendReqestWindow() {
    //getAllFR();
    if (fwin != null) {
        if (fwinwas) {
            fwin.hide();
        } else {
            fwin.show();
        }
        fwinwas = !fwinwas;
        return;
    }
    if (win != null) win.show();
    if (Set != null) {
        Set.close();
    };
    fwin = new BrowserWindow({
        width: 250,
        height: 400,
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
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });
    fwin.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        fwin = null;
    });
    fwin.loadFile("src/html/friends.html");
    fwin.webContents.once('did-finish-load', function() {
        //set the theme to the settings current theme
        //fwin.openDevTools();
        var file = path.join(__dirname, `Themes/${Settings.Theme}.css`);
        fwinwas = true;
        ////console.log(file);
        ////console.log(fs.existsSync(path.join(file)));
        if (!fs.existsSync(filename) || Settings.Theme == "Dark") {
            //console.log(path.join(__dirname,"src/css/Themes/Dark.css"));
            fwin.webContents.send("MainChanged",
                path.join(__dirname, "src/css/Themes/Dark.css"), "Dark");
            fwin.show();
        } else {
            fwin.webContents.send("MainChanged", file);
            fwin.show();
            setTimeout(getAllFR, 250);
        }
        //getAllFR();
    });
}

// finds the users name and returns the UID : User ID
function findUserByName(name) {
    return new Promise((resolve) => {
        ////console.log("Tying To Find User : " + name);
        // gets all the users where thier name is equal to the given name
        var q = allUsers.where("name", "==", name);
        // get the values from the data based and returns if no error occuredA.
        q.get().then((snap) => {
            snap.forEach((data) => {
                //console.log(data.id + " => " + data.data());
                resolve(data.data());
                return;
            })
            })
            .catch((err) => {
                //console.log("FROM findUserByName Line:965->\n" + err);
                resolve(null);
                return;
            });
    });
}

ipcMain.on("sendFR", (event, args) => {
    //cant send FR to yourself
    if (args == userName) {
        showMessage("DUMBIE!", "Cant Send A Friend Request To Yourself");
        return;
    }
    //console.log("Sending Friend Request TO: " + args);
    findUserByName(args).then((d) => {
        var foundMe = false;
        var modifiedData = d;
        if (modifiedData.frequests == null) modifiedData.frequests = [];
        for (var i = 0; i < d.frequests.length; i++) {
            if (d.frequests[i].uid == currentUser.uid) {
                foundMe = true;
                showMessage("STALKER!", "You've Already Sent A Friend Request To This User!");
                    return;
            }

            if (d.friends[i] == currentUser.uid) {
                foundMe = true;
                showMessage("MEGA-STALKER!", "You've Already Friends With This User!");
            }

            var uid = d.uid;
            var myData = {
                uid: currentUser.uid,
            }
            // add myself to the friend requets
            modifiedData.frequests.push(myData);
            writeUserData(uid, modifiedData).then(_ => {
                showMessage("SENT!", "Sent Friend Request To " + username.toLowerCase() + ".");
            });
        }
    });
});

ipcMain.on("openFriends", _ => {
    ////console.log("OPENING FRIENDS WINDOW...");
    friendReqestWindow();
});

var FriendRequests = [];
var Friends = [];

ipcMain.on("getAllFriendsReq", _ => {
    ////console.log("Updating Friends List...");
    getAllFR();
    getAllFriends();
});
    
async function getAllFriendsWithDoc(data){
    console.log(data);
    FriendRequests = data.friends;
    if(FriendRequests == null || FriendRequests == undefined) return;
    
    Friends = [];
    //remove all undefined from friend requests
    var filtered = FriendRequests.filter(function(x) {
        return x !== undefined;
    });
    var FinalFriends = [];
    for (var i = 0; i < FriendRequests.length; i++) {
        if (FriendRequests[i] != null && FriendRequests[i] != undefined) {
            //console.log("DOING + " + FriendRequests[i].uid);
            getUserData(FriendRequests[i].uid)
                .then((d) => {
                    // get the name here
                    if (d != null) {
                        var FR = {
                            name: d.name,
                            uid: d.uid,
                            pic: d.pic,
                        }
                        FinalFriends.push(FR);
                        if (i >= FriendRequests.length - 1) {
                            // wont run code unless the 'friends' window is loaded
                            if (win == null) return;
                            console.log("FRIENDS:")
                            console.log("====================================================");
                            console.log(FinalFriends)
                            win.webContents.send("getF", FinalFriends);
                            //streamFR();
                        }
                    }
                });
        }
    }
}

async function getAllFriends() {
    if (currentUser == null) return;
    // resets the friend requests
    FriendRequests = [];
    getUserData(currentUser.uid)
    .then((data) => {
        FriendRequests = data.friends;
        Friends = [];
        //remove all undefined from friend requests
        var filtered = FriendRequests.filter(function(x) {
            return x !== undefined;
        });
        var FinalFriends = [];
        for (var i = 0; i < FriendRequests.length; i++) {
            if (FriendRequests[i] != null && FriendRequests[i] != undefined && FriendRequests[i].uid != null && FriendRequests[i].uid != undefined) {
                //console.log("DOING + " + FriendRequests[i].uid);
                getUserData(FriendRequests[i].uid)
                .then((d) => {
                    // get the name here
                    if (d != null) {
                        var FR = {
                            name: d.name,
                            uid: d.uid,
                            pic: d.pic,
                        }
                        FinalFriends.push(FR);
                        if (i >= FriendRequests.length - 1) {
                            // wont run code unless the 'friends' window is loaded
                            if (win == null) return;
                            console.log("FRIENDS:")
                            console.log("====================================================");
                            console.log(FinalFriends)
                            win.webContents.send("getF", FinalFriends);
                            //streamFR();
                        }
                    }
                });
            }
        }
    });
}

//open links ect
const open = require('open');
//const { data } = require('jquery');
ipcMain.on("openLink",(event, args) => {
    console.log("================================> OPENING FILE!");
    console.log(args);
    open(args);
});

//gets all the friends associated with the current user
async function getAllFR() {
    if (currentUser == null) return;
    // resets the friend requests
    FriendRequests = [];
    getUserData(currentUser.uid)
    .then((data) => {
        FriendRequests = data.frequests;
        Friends = [];
        //remove all undefined from friend requests
        var filtered = FriendRequests.filter(function(x) {
            return x !== undefined;
        });
        var FinalFriends = [];
        for (var i = 0; i < FriendRequests.length; i++) {
            if (FriendRequests[i] != null && FriendRequests[i] != undefined) {
                //console.log("DOING + " + FriendRequests[i].uid);
                getUserData(FriendRequests[i].uid)
                .then((d) => {
                    // get the name here
                    if (d != null) {
                        var FR = {
                            name: d.name,
                            uid: d.uid,
                        }
                        FinalFriends.push(FR);
                        if (i >= FriendRequests.length - 1) {
                            // wont run code unless the 'friends' window is loaded
                            if (fwin == null) return;
                            //console.log("FRIENDS:")
                            //console.log("====================================================");
                            //console.log(FinalFriends)
                            fwin.webContents.send("getFR", FinalFriends);
                        }
                    }
                });
            }
        }
    });
}
async function updateFR(data) {
    FriendRequests = data.frequests;
    if(FriendRequests == null || FriendRequests == undefined) return;
    Friends = [];
    //remove all undefined from friend requests
    var filtered = FriendRequests.filter(function(x) {
        return x !== undefined;
    });
    var FinalFriends = [];
    for (var i = 0; i < FriendRequests.length; i++) {
        if (FriendRequests[i] != null && FriendRequests[i] != undefined) {
            //console.log("DOING + " + FriendRequests[i].uid);
            getUserData(FriendRequests[i].uid)
            .then((d) => {
                // get the name here
                if (d != null) {
                    var FR = {
                        name: d.name,
                        uid: d.uid,
                    }
                    FinalFriends.push(FR);
                    if (i >= FriendRequests.length - 1) {
                        // wont run code unless the 'friends' window is loaded
                        if (fwin == null) return;
                        //console.log("FRIENDS:")
                        //console.log("====================================================");
                        //console.log(FinalFriends)
                        fwin.webContents.send("getFR", FinalFriends);
                    }
                }
            });
        }
    }
}
ipcMain.on("AcceptReq", (event, uID) => {
    acceptFriendRequest
        (uID);
});

function acceptFriendRequest(userID) {
    //find friend in all friends list of current user
    getUserData
        (currentUser
            .uid
        )
        .then((data) => {
            var modifiedData = data;
            var uid = modifiedData
                .frequests
                .find(obj => {
                    // Returns the object where
                    // the given property has some value
                    return obj
                        .uid === userID;
                })
            //remove from friend request list
            var index = modifiedData
                .frequests
                .indexOf(uid);
            if (index !==
                -
                1) {
                modifiedData
                    .frequests
                    .splice(index,
                        1);
            }
            //console.log("REMOVED MY UID!");
            //console.log(modifiedData.frequests);
            //save to the new Friends array
            modifiedData
                .friends
                .push(uid);
            //save all the data back
            writeUserData
                (currentUser
                    .uid, modifiedData);
            //console.log("Accepted Friends");
            //console.log(modifiedData.friends);
            //update friends List
            getAllFR();
            getAllFriends();
        });
}
var currentFriendUID = "";
var Msg = []; 
ipcMain.on("messageFriend", (event, data) => {
    var friendUID = data.uid;
    var friendName = data.name;

    win.webContents.send("oUID",friendUID);
    win.webContents.send("oName",friendName);


    currentFriendUID
        = friendUID;
    getMessages
        (currentUser
            .uid, currentFriendUID);
}); 

function getLargerID(){
    var myID = currentUser.uidreplace(/\D/g, '');
    var otherID = currentFriendUID.replace(/\D/g, '');
    var ID;
    if (myID.length > otherID.length) {
        ID = from + to;
    } else {
        ID = to + from;
    }
    return ID;
}

var updatedDoc = null;
ipcMain.on("sendoffer",(event,offer) => {
    //send offer in new db collection
    var documentName = getLargerID();
    var caller = {offer: offer,uid: currentUser.uid};
    var answer = {offer: null,uid: null};

    allCalls.doc(documentName).get()
    .then((doc) => {
        //get the document data values
        var callerData = {};
        var data = doc.data();
        var caller = true;

        if(doc.exists){
            callerData.caller = data.caller;
            callerData.answer = caller;
            caller = false;

            //send back true becuase you called
            //webRTC.sendBackCall();
        }
        else{
            callerData.caller = caller;
            callerData.answer = null;
        }

        //save the new document
        allCalls.doc(documentName).set(callerData, {merge: true});
        
        //remove old snapshot watcher
        if(updatedDoc != null){
            updatedDoc();
            updatedDoc = null;
        }

        //skip if has answered the call
        if(caller == true){
            //watch the document for any updates
            updatedDoc = allCalls.doc(documentName).onSnapshot((doc) => {
                //wait for caller updates
                var data = doc.data();

                if(data.answer != null){
                    //answer the call and scrap the document updater
                    //webRTC.sendBackCall();

                    //scrap the updateFR
                    updatedDoc();
                    updatedDoc = null;
                }
            });
        }
    })
});

var lastCalls = [];
function checkForCalls(data){
    //look for call updates
}

ipcMain.on("sendMsg", (event, msg) => {
    if (msg == "" || msg == null || msg == undefined) {
        //showMessage("ERROR", "Sent Message Is Undefined");
        return;
    }
    if (currentFriendUID == null || currentFriendUID == "" || currentFriendUID == undefined) {
    showMessage("ERROR", "Friend Not Selected, Please Select Friend From The LeftSide Bar");
        return;
    }
    sendMessage(msg, currentUser.uid, currentFriendUID)
});

var messageUpdate;
var allMsgs = db.collection('allMessages');

function sendMessage(Message, from, to) {
    return new Promise((resolve) => {
        if (from === undefined || to === undefined || from == null || to == null || from ==
            "" || to == "") return;
        var myID = from.replace(/\D/g, '');
        var otherID = to.replace(/\D/g, '');
        var ID;
        if (myID.length > otherID.length) {
            ID = from + to;
        } else {
            ID = to + from;
        }
        var databasedoc = allMsgs.doc(ID)
        var newMsg = {
            from: from,
            msg: Message,
        };
        databasedoc.get()
            .then((data) => {
                var newData = data.data();
                if (!data.exists) {
                    newData = {
                        messages: []
                    };
                }
                if (newData.messages == null || newData.messages == undefined) {
                    newData.messages = [];
                }
                newData.messages.push(newMsg);
                console.log("DATA?");
                console.log(newData);
                databasedoc.set(newData, {
                    merge: true
                })
                .then(_ => {
                    //console.log('Saved Data Good :D');
                    getMessages(currentUser.uid, currentFriendUID);
                    resolve();
                })
                .catch(err => {
                    //console.log("error wriritng to doc: " + err);
                    getMessages(currentUser.uid, currentFriendUID);
                    resolve();
                });

                messageUpdate = databasedoc.onSnapshot({}, (doc) => {
                    getMessagesOnSnapshotUpdate(doc);
                });
        });
    });
}

function getMessages(from, to) {
    return new Promise((resolve) => {
        if (from === undefined || to === undefined || from == null || to == null || from ==
            "" || to == "") return;
        var myID = from.replace(/\D/g, '');
        var otherID = to.replace(/\D/g, '');
        var ID;
        if (myID.length > otherID.length) {
            ID = from + to;
            //console.log("MY ID LARGER: T");
        } else {
            ID = to + from;
            //console.log("MY ID LARGER: F");
        }
        //console.log("ChoSEN ID : " + ID);
        var databasedoc = allMsgs.doc(ID);

        messageUpdate = databasedoc.onSnapshot({}, (doc) => {
            getMessagesOnSnapshotUpdate(doc);
        })

        databasedoc.get()
        .then((data) => {
            if (!data.exists) {
                //console.log("Could Not Find Document");
                var d = {
                    messages: [],
                };
                databasedoc.set(d, {
                        merge: true
                    })
                    .then(_ => {
                        //console.log('Saved Data Good :D');
                        if (win != null) {
                            win.webContents.send("getM", [d,currentUser.uid]);
                        }
                        resolve(d);
                    })
                    .catch(err => {
                        //console.log("error wriritng to doc: " + err);
                        if (win != null) {
                            win.webContents.send("getM", [d,currentUser.uid]);
                        }
                        resolve(d);
                    });
            } else {
                //console.log("Found Doc:");
                //console.log(data.data().messages);
                if (win != null) {
                    win.webContents.send("getM", [data.data().messages,currentUser.uid]);
                }
                resolve(data.data().messages);
            }
        });
    });
}

function getMessagesOnSnapshotUpdate(data) {
    return new Promise((resolve) => {
        if (!data.exists) {
            console.log("Could Not Find Document");
            var d = {
                messages: [],
            };
            databasedoc.set(d, {
                    merge: true
                })
                .then(_ => {
                    //console.log('Saved Data Good :D');
                    if (win != null) {
                        win.webContents.send("getM", [d,currentUser.uid]);
                    }
                    resolve(d);
                })
                .catch(err => {
                    //console.log("error wriritng to doc: " + err);
                    if (win != null) {
                        win.webContents.send("getM", [d,currentUser.uid]);
                    }
                    resolve(d);
                });
        } else {
            console.log("Found Doc:");
            console.log(data.data().messages);
            if (win != null) {
                win.webContents.send("getM", [data.data().messages,currentUser.uid]);
            }
            resolve(data.data().messages);
        }
    });
}