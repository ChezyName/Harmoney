var ThemesOpened = false;
var CurrTheme = "";
var CurrentTheme;

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

        Theme.value = CurrTheme;
        if(CurrTheme == "" || CurrTheme == undefined){
            var op = Themes.options;

            for(let i = 0; i < op.length; i++){
                console.log("Compairing.....");
                console.log(op[i].value);
                console.log(CurrentTheme);
                
                if(op[i].value.includes(CurrentTheme)){
                    console.log(op[i].value);
                    Themes.value = op[i].value;
                    CurrTheme = op;
                }
            }
        }
    });

    document.onkeydown=keydownHandler;

    window.api.receive("ThemeChanged", (theme,_t) => {
        CurrentTheme = _t;
        // Change Theme For The Document
        Theme.setAttribute("href", theme);
        console.log("Theme was : " + theme)

        var op = Themes.options;
        console.log("THEMES LENGTH IS: " + op.length);
        for(let i = 0; i < op.length; i++){
            if(op[i].value.includes(_t)){
                Themes.value = op[i].value;
                CurrTheme = op;
            }
        }
    });

    var refresh = document.getElementById("RT");
    refresh.addEventListener('click', function(e) {
        window.api.send("SendAllThemes");
    });

    var openFolder = document.getElementById("OTF");
    openFolder.addEventListener('click', function(e) {
        window.api.send("OpenFolder");
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
        CurrentTheme = _t;
        console.log("Changing Theme To New Theme : " + t);
        if(t == null) return;
        console.log("Chaning Theme To : " + t);
        Theme.setAttribute("href", t);

        var op = Themes.options;

        for(let i = 0; i < op.length; i++){
            console.log("Compairing.....");
            console.log(op[i].value);
            console.log(_t);

            if(op[i].value.includes(_t)){
                console.log(op[i].value);
                Themes.value = op[i].value;
                CurrTheme = op;
            }
        }
    });
}