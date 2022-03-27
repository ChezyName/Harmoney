load = async function() {
    console.log("Loading WebRTC Client...");
    
    /*
    vid.muted = true;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
        //audio stream
    });
    */

    var topBar = document.getElementById('Top_BG');

    var friendName = document.getElementById('TopName');
    var callButton = document.getElementById('CallButton');

    var d1 = friendName.style.display;
    var d2 = callButton.style.display;


    friendName.style.display = "none";
    callButton.style.display = "none";

    var submit = document.getElementById('submitBtn');
    submit.disabled = true;

    window.api.receive("oUID", (event,UID) => {
        console.log("GOT UID? -> " + UID);

        if(UID != undefined && UID != null) currentFriend = UID;
        submit.disabled = false;

        friendName.style.display = d1;
        callButton.style.display = d2;
    });

    //load webrtc client : Peer.JS
    stream = navigator.mediaDevices.getUserMedia({ audio: true, video: true });
}

webRTC = { onLoad: load} 