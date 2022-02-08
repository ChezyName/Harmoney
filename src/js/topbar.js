var MenuOpened = false;
var Theme = "Dark";

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val.msg === b[index].msg);
}

const isImgLink = (url) => {
    if (typeof url !== 'string') {
      return false;
    }
    return (url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gmi) !== null);
}

function isValidUrl(_string){
    const matchPattern = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/;
    return matchPattern.test(_string);
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
    var search = document.getElementById('search');

    var frbds = [];
    var fButtons = [];
    window.api.receive("getF",(data) => {
        console.log(data);
        // if friends list did not change return
        if(arrayEquals(frbds,data)) return;

        //remove all children from fParent
        removeAllChildNodes(fParent);
        fButtons = [];

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
                fButtons.push(b);
            }
        }

        for(var i = 0; i < 250; i++){
            var b = document.createElement("button");
            b.innerHTML = "USER-" + i;
            //add button as the child of accept / acc
            fParent.appendChild(b);
            fButtons.push(b);
        }

        frbds = data;

        // add search Functionality
        if(fButtons == null || fButtons == undefined) return;
        var value = search.value;
        value = value.toLowerCase();
        
        if(value == undefined || value == ""){
            fButtons.forEach(user => {
                if(user != undefined && user != null){
                    user.classList.toggle("hide",false);
                }
            });
            return;
        }

        fButtons.forEach(user => {
            if(user != undefined && user != null){
                console.log("THIS: " + user.innerHTML + " HAS " + value + ":" + user.innerHTML.includes(value));
                const isVisible = user.innerHTML.toLowerCase().includes(value);
                user.classList.toggle("hide",!isVisible);
            }
        });
    });

    var lastMsgs;
    window.api.receive("getM",(d) => {
        var data = d[0];
        if(data == undefined || data == null || data == [] || data == "") return;

        if(arrayEquals(lastMsgs,data)) return;

        console.log("NEW:" + data);
        console.log("OLD: " + lastMsgs);
        var uid = d[1];
        //remove all children from mParent
        removeAllChildNodes(mParent);

        for(var i = 0; i < data.length; i++) {
            //get the data and add the button to the array and continue
            //console.log(data[i]);

            if(data[i] != undefined && data[i] != null) {

                // open the image if its an image link
                if(isImgLink(data[i].msg)){
                    //add the image to the messege count
                    var b = document.createElement("img");
                    b.src = data[i].msg;
                    b.id = data[i].from;

                    //set the height of the image by the width and the ratio IE
                    // if the image is 1920x1080 the ratio is 16 by 9, if we have the width as 680px * (1080/1920) -RATIO
                    //we get the scale of the image
                    var img = new Image();
                    img.addEventListener("load", function() {
                        var HRatio = this.naturalHeight/this.naturalWidth;
                        console.log("WD Ratio: " + HRatio);
                        b.height = b.width * HRatio; // make the image scale properly using the width witch is
                        // constant and scaling the height of the image by the Ratio using the width
    
                    });
                    img.src = data[i].msg;

                    b.classList.add("Image");

                    // move message to the right side if not sent from this user
                    if(data[i].from != uid){
                        //not from this user
                        b.classList.add("otherMessege");
                    }

                    //add image as the child of the messege container
                    mParent.appendChild(b);
                }
                else if(isValidUrl(data[i].msg)){
                    //add the image to the messege count
                    var b = document.createElement("button");
                    b.innerHTML = data[i].msg;
                    //b.href = data[i].msg;
                    b.id = data[i].from;

                    console.log("ISLINK:");
                    console.log(data[i].msg);

                    b.classList.add("Button");

                    b.addEventListener("click", function(){
                        window.api.send("openLink",b.innerHTML);
                    });

                    // move message to the right side if not sent from this user
                    if(data[i].from != uid){
                        //not from this user
                        b.classList.add("otherMessege");
                    }

                    //add image as the child of the messege container
                    mParent.appendChild(b);
                }
                else{
                    //add the txt to a div element
                    var b = document.createElement("div");
                    b.innerHTML = data[i].msg;
                    b.id = data[i].from;
                    // move message to the right side if not sent from this user

                    if(data[i].from != uid){
                        //not from this user
                        b.classList.add("otherMessege");
                    }

                    //add button as the child of accept / acc
                    mParent.appendChild(b);
                }
            }
        }

        console.log("Arrays Are Same Bcs: " + arrayEquals(lastMsgs,data));

        if(!arrayEquals(lastMsgs,data)){
            mParent.scrollTop = mParent.scrollHeight;
        }

        lastMsgs = data;
    });

    search.addEventListener('keypress' ,(key) => {
        if(fButtons == null || fButtons == undefined) return;
        var value = search.value + key.key;
        value = value.toLowerCase();

        if(value == undefined || value == ""){
            fButtons.forEach(user => {
                if(user != undefined && user != null){
                    user.classList.toggle("hide",false);
                }
            });
            return;
        }

        fButtons.forEach(user => {
            if(user != undefined && user != null){
                console.log("THIS: " + user.innerHTML + " HAS " + value + ":" + user.innerHTML.includes(value));
                const isVisible = user.innerHTML.toLowerCase().includes(value);
                user.classList.toggle("hide",!isVisible);
            }
        });
    });

    search.onkeydown = function(){
        var key = event.keyCode || event.charCode;

        if( key == 8 || key == 46 ){
            
        if(fButtons == null || fButtons == undefined) return;
        var value = search.value;
        value = value.toLowerCase();
        value = value.slice(0, -1);

        console.log("BACKSPACED: " + value);

        if(value == undefined || value == ""){
            fButtons.forEach(user => {
                if(user != undefined && user != null){
                    user.classList.toggle("hide",false);
                }
            });
            return;
        }

        fButtons.forEach(user => {
            if(user != undefined && user != null){
                console.log("THIS: " + user.innerHTML + " HAS " + value + ":" + user.innerHTML.includes(value));
                const isVisible = user.innerHTML.toLowerCase().includes(value);
                user.classList.toggle("hide",!isVisible);
            }
        });
        }
    }

    search.onkeyup = function(event) {
        if (this.value.length === 0) {
            //reset everything
            value = "";
            fButtons.forEach(user => {
                if(user != undefined && user != null){
                    console.log("THIS: " + user.innerHTML + " HAS " + value + ":" + user.innerHTML.includes(value));
                    const isVisible = user.innerHTML.toLowerCase().includes(value);
                    user.classList.toggle("hide",!isVisible);
                }
            });
        }
      }
    
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