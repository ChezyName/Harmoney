const {
    contextBridge,
    ipcRenderer
} = require("electron");

let validChannels = ["close","min","settings","closesettings","ThemeChanged","ChangeTheme","MainChanged","msg","register","onIcon","addUser","SentUsername","changeIcon","signOut","closeFriends","ReturningPP","login","openFriends","FriendRequests","sendFR","getAllFriendsReq","getFR","AcceptReq","getF","messageFriend","sendMsg","getM","openLink","resetInput","oUID","oName","sendoffer","rcalls"];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        getTheme: _ =>{
            return ipcRenderer.send("GetTheme");
        },
        send: (channel, data) => {
            // whitelist channels
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        getFriendsList: (func) => {
            ipcRenderer.on("getFR", (event, ...args) => func(...args));
        },
        getIcon: _ => {
            return ipcRenderer.send("GetIcon");
        },
        getUsername: _ => {
            return ipcRenderer.send("GetUsername")
        },
        getProfilePic: _ => {
            return ipcRenderer.send("GetPP");
        },
    }
);