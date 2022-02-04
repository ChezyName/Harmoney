function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

window.onload = function() {
    var friendButtons = [];
        
    var close = document.getElementById("close");
    var Theme = document.getElementById('Theme');

    var accept = document.getElementById("acpt");
    var send = document.getElementById("snd");

    // accept div element to be moved
    var acc = document.getElementById("accept");
    var sendFR = document.getElementById("FR");

    window.api.getFriendsList((data) => {
        removeAllChildNodes(acc);

        for(var i = 0; i < data.length; i++) {
            //get the data and add the button to the array and continue
            var btn = document.createElement("button");
            btn.innerHTML = data[i].name;
            btn.name = data[i].uid;
            btn.addEventListener("click", _ =>{
                //call the api to accept the request
                console.log("ACCEPTING: " + btn.innerHTML);
                window.api.send("AcceptReq",btn.name);
            });
            //add button as the child of accept / acc
            acc.appendChild(btn);
        }
    });

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