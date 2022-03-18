var fNAME;
var currentFriend = null;

const servers = {
    iceServers: [
        {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
    ],
    iceCandidatePoolSize: 10,
};


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

    //Web RTC Loading
    const pc = new RTCPeerConnection(servers);
    let localStream = null;
    let remoteStream = null;

    var called = false;
    async function startWebcam(){
        //ask user for video and audio streams
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        // Push tracks from local stream to peer connection
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });
    }

    async function startAudio(){
        //ask user for video and audio streams
        localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

        // Push tracks from local stream to peer connection
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });
    }

    async function startCall(){
        //check if its answering or calling
        
        //creating a call
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);
      
        const offer = {
          sdp: offerDescription.sdp,
          type: offerDescription.type,
        };
        console.log("FUID -> " + currentFriend);
        window.api.send("sendoffer",offer);
    }

    var sideFriends = document.getElementById("FriendHolder");
    window.api.receive("rcalls", (event,calls) => {
        for(var i = 0; i < sideFriends.children.length; i++){
            var f = sideFriends.children[i];
            
            if(calls.includes(f.name)){
                f.classList.add("onCall");
            }
            else{
                f.classList.remove("onCall");
            }
        }
    });

    remoteStream = new MediaStream();

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = event => {
        event.streams[0].getTracks().forEach(track => {
            remoteStream.addTrack(track);
        });
    };


    callButton.addEventListener("click", _ => {
        //start or stop call
        if(called){
            localStream = null;
            //end call
            console.log("ENDING")
            called = false;
        }
        else{
            console.log("Calling User");
            startCall();
        }
    });
}

webRTC = { onLoad: load, onFriendClicked: onclick} 