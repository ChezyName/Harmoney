function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

//used to make random ID's for 'fake users'
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
   }
   return result;
}

window.onload = function() {
    var friendButtons = [];
        
    var close = document.getElementById("close");
    var Theme = document.getElementById('Theme');

    var accept = document.getElementById("acpt");
    var send = document.getElementById("snd");

    // accept div element to be moved
    var acc = document.getElementById("accept");
    var acchild = document.getElementById("accfr");
    var sendFR = document.getElementById("FR");

    var search = document.getElementById("Sbox");

    var freq = [];
    window.api.getFriendsList((data) => {
        removeAllChildNodes(acc);
        freq = [];

        for(var i = 0; i < data.length; i++) {
            //get the data and add the button to the array and continue
            var btn = document.createElement("button");
            btn.innerHTML = data[i].name;
            btn.name = data[i].uid;
            btn.addEventListener("click", _ =>{
                //call the api to accept the request
                console.log("ACCEPTING: " + this.innerHTML);
                window.api.send("AcceptReq",this.name);
            });
            freq.push(btn);
            //add button as the child of accept / acc
            acchild.appendChild(btn);
        }
    });

    //testing with fake users
    /*
    for(var i = 0; i < 250; i++) {
        //get the data and add the button to the array and continue
        var btn = document.createElement("button");
        btn.innerHTML = makeid(12);
        btn.name = 255;
        freq.push(btn);
        //add button as the child of accept / acc
        acchild.appendChild(btn);
    }
    */

    function enabledisableallfq(value){
        if(freq == null || freq  == undefined) return;

        if(value == undefined || value == ""){
            freq.forEach(user => {
                if(user != undefined && user != null){
                    user.classList.toggle("hide",false);
                }
            });
            return;
        }

        freq.forEach(user => {
            if(user != undefined && user != null){
                console.log("THIS: " + user.innerHTML + " HAS " + value + ":" + user.innerHTML.includes(value));
                const isVisible = user.innerHTML.toLowerCase().includes(value);
                user.classList.toggle("hide",!isVisible);
            }
        });
    }

    //search bar
    search.addEventListener('keypress' ,(key) => {
        enabledisableallfq(search.value + key.key);
    });

    search.onkeyup = function(event) {
        if(this.value.length === 0){
            enabledisableallfq("");
        }
        else{
            enabledisableallfq(search.value);
        }
    }

    close.addEventListener('click',() =>{
        window.api.send("closeFriends");
    });

    window.api.receive("MainChanged", (t) => {
        //console.log("Changing Theme To New Theme : " + t);
        if(t == null) return;
        //console.log("Chaning Theme To : " + t);
        Theme.setAttribute("href", t);
    });

    accept.addEventListener("click", _ =>{
        acc.style.left = "0%";
    });

    send.addEventListener("click", _ =>{
        acc.style.left = "100%";
    });

    sendFR.addEventListener("click", _ =>{
        console.log("SENDING FREND Request!");
        var name = document.getElementById("FriendBox").value;
        window.api.send("sendFR",name);
        document.getElementById("FriendBox").value = "";
    });

    //call once to update the friends List
    window.api.send("getAllFriendsReq");
}