window.onload = function() {
    var close = document.getElementById("close");
    var done = document.getElementById("Done");

    var name = document.getElementById("NameBox");

    var selectImage = document.getElementById("PictureSelect");
    var Image = document.getElementById("Image");

    selectImage.addEventListener('click', _ => {
        window.api.getIcon();
    })

    close.addEventListener('click',() =>{
        window.api.send("close");
    });

    done.addEventListener('click',() =>{
        var fixedName = name.value.replace(/[^a-z\d\s]+/gi, '');
        fixedName = fixedName.replace(/\s/g, '');

        var args = {
            UserName: fixedName,
        }

        window.api.send("addUser",args);
    })

    window.api.receive("onIcon", (icn) => {
        // change the icon for the users images
        console.log("SETTING IMG TO : " + icn);
        Image.src = icn;
        if(icn == null || icn == ""){
            Image.src = "../UserBasicIcon.png";
            console.log("RESET IMG");
        }
    });

    // get the icon right away from the main process
    console.log("Trying TO Get Profile Picture");
    setTimeout(() => window.api.getProfilePic(), 500);
}