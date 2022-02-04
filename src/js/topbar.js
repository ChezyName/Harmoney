var MenuOpened = false;
var Theme = "Dark";

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

window.onload = function() {
    var closeBtn = document.getElementById('close');
    var minBtn = document.getElementById('minimize');
    var Menu = document.getElementById('menu');
    var Side = document.getElementById('sideBar');
    var Settings = document.getElementById('settings');

    var fParent = document.getElementById('FriendHolder');

    var userTexting = document.getElementById('TopName');
    var addF = document.getElementById('addFriend');

    var title = document.getElementById('titleShown');

    var Theme = document.getElementById('Theme');

    var msgBox = document.getElementById('msgbox');
    var sendBtn = document.getElementById('submitBtn')

    var mParent = document.getElementById('messeges');

    window.api.receive("getF",(data) => {
        console.log(data);

        //remove all children from fParent
        removeAllChildNodes(fParent);

        for(var i = 0; i < data.length; i++) {
            //get the data and add the button to the array and continue
            //console.log(data[i]);

            if(data[i] != undefined && data[i] != null) {
                var b = document.createElement("button");
                b.innerHTML = data[i].name;
                b.name = data[i].uid;
                b.addEventListener("click", _ =>{
                    //call the api to accept the request
                    console.log("Clicked On Friend: " + b.innerHTML + " WITH UID: " + b.name);
                    window.api.send("messageFriend",b.name);
                });
                //add button as the child of accept / acc
                fParent.appendChild(b);
            }
        }
    });

    window.api.receive("getM",(data) => {
        if(data == undefined || data == null || data == [] || data == "") return;
        console.log(data);

        //remove all children from mParent
        removeAllChildNodes(mParent);

        for(var i = 0; i < data.length; i++) {
            //get the data and add the button to the array and continue
            //console.log(data[i]);

            if(data[i] != undefined && data[i] != null) {
                var b = document.createElement("div");
                b.innerHTML = data[i].msg;
                b.name = data[i].from;
                //add button as the child of accept / acc
                mParent.appendChild(b);
            }
        }
    });

    if(closeBtn){
        closeBtn.addEventListener('click',() =>{
            window.api.send("close");
        });
    }

    if(minBtn){
        minBtn.addEventListener('click',() =>{
            window.api.send("min");
        });
    }

    if(Menu){
        // ☰ = Non Hovered
        // > = Not Opened & Hovering
        // < = Already Opened At All Times
        
        //Min Size : 42px
        //Max Size : 84px

        Menu.addEventListener('click',() =>{
            MenuOpened = !MenuOpened;
            Side.style.width = MenuOpened ? "200px" : "42px";
            console.log("On CLicked!");
        });
    }

    if(Settings){
        Settings.addEventListener('click',() =>{
            window.api.send("settings");
            console.log("Settings.Click!");
        });
    }

    window.api.receive("ThemeChanged", (theme) => {
        // Change Theme For The Document
        console.log("ThemeChanged...");
        window.api.getTheme();
    });


    window.api.receive("MainChanged", (t) => {
        console.log("Changing Theme To New Theme : " + t);
        if(t == null) return;
        console.log("Chaning Theme To : " + t);
        Theme.setAttribute("href", t);
    });

    // set the title of the app to Harmoney / username of the user 
    window.api.receive("SentUsername", (name) => {
        console.log(name);
        title.innerHTML = "Harmoney/" + name;
        //userTexting.innerHTML = "  Welcome, " + name + ".";
    });

    addF.addEventListener('click', _ => {
        // open friends mini-Window
        window.api.send("openFriends");
    });

    msgBox.addEventListener('keypress' ,(key) => {
        if(key.key == 'Enter'){
            sendMessage(msgBox.value);
            msgBox.value = "";
        }
    });

    sendBtn.addEventListener('click', _ => {
        sendMessage(msgBox.value);
        msgBox.value = "";
    });

    function sendMessage(msg){
        window.api.send("sendMsg",msg);
    }
}