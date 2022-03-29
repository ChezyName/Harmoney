var ThemesOpened = false;
var Theme = "Dark.css";

var basicThemes = ["Dark","Light","MidnightBlue","Carrot"];

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
}

window.onload = function() {
    var close = document.getElementById("close");

    //var ThemesParent = document.getElementById("themes");
    //var Content = document.getElementById("contents");

    //var change = document.getElementById("accset");
    var signout = document.getElementById("logout");

    var Theme = document.getElementById('Theme');

    var Themes = document.getElementById("ThemeDropdown");

    close.addEventListener('click',() =>{
        console.log("Clickin");
        window.api.send("closesettings")
    });

    /*
    change.addEventListener('click',() =>{
        window.api.send("changeIcon");
    });
    */

    signout.addEventListener('click',() =>{
        window.api.send("signOut");
    });

    //ThemesParent.classList.add("move" + (ThemesOpened ? "T" : "F"));
    //Content.classList.add("move" + (ThemesOpened ? "T" : "F"));

    function keydownHandler(e) {
        var evt = e ? e:event;
          var keyCode = evt.keyCode;
        
          if (keyCode==38 || keyCode==39 || keyCode==40 || keyCode==37){ //arrow keys
        e.preventDefault()
        scrollTo(0,0);
        }
    }
    
    Themes.addEventListener('change', () =>{
        var t = Themes.value;
        console.log("Themes" + t);
        ChangeTheme(t);
    });

    function addOption(name,parent){
        var option = document.createElement("option");
        option.value = name;
        option.innerHTML = name;
        parent.appendChild(option);
    }

    var allThemes = {};
    window.api.receive("CustomThemes", (themes) => {
        console.log("getting custom themes.exe.json: ");
        console.log(themes);
        
        allThemes = themes;
        removeOptions(Themes);

        basicThemes.forEach(function(Themename){
            addOption(Themename,Themes)
        });

        allThemes.forEach(function(file){
            var filename = file.replace('.css','');
            console.log("Adding : " + filename + " TO The Custom Themes List");
            addOption(filename,Themes)
        });
    });

    document.onkeydown=keydownHandler;

    window.api.receive("ThemeChanged", (theme) => {
        // Change Theme For The Document
        Theme.setAttribute("href", theme);
    });



    /*
    function ThemeWindow(){
        //title.innerHTML = ThemesOpened ? "Themes" : "Settings";

        ThemesParent.classList.add("move" + (ThemesOpened ? "T" : "F"));
        ThemesParent.classList.remove("move" + (ThemesOpened ? "F" : "T"));

        Content.classList.add("move" + (ThemesOpened ? "T" : "F"));
        Content.classList.remove("move" + (ThemesOpened ? "F" : "T"));
    }
    */

    function ChangeTheme(Theme){
        window.api.send("ChangeTheme",(Theme));
    }

    window.api.receive("MainChanged", (t,_t) => {
        console.log("Changing Theme To New Theme : " + t);
        if(t == null) return;
        console.log("Chaning Theme To : " + t);
        Theme.setAttribute("href", t);
        Themes.value = _t;
    });
}