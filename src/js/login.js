var shown = false;
function showPassword(document,btn){
    // close PassShow: 😑
    // show password: 😐
    shown = !shown;
    var type = shown ? "text" : "password";
    var button = shown ? "😑" : "😐";

    //console.log(shown + ": " + type + " - " + button);

    // set text and type
    document.type = type;
    btn.innerHTML = button;
}

window.onload = function() {
    var close = document.getElementById("close");
    var Theme = document.getElementById('Theme');

    var passBox = document.getElementById("PassBox");
    var showPass = document.getElementById("ShowPassword");

    var email = document.getElementById("EmailBox");
    var pass = document.getElementById("PassBox");

    var register = document.getElementById("register");
    var login = document.getElementById("login");

    showPass.addEventListener('click', _ => {
        //console.log("Doing On Click For ShowPassword BTN");
        showPassword(passBox,showPass);
    });

    close.addEventListener('click',() =>{
        window.api.send("close");
    });

    register.addEventListener('click',() =>{
        var data = {
            Email: email.value,
            Pass: pass.value,
        };
        window.api.send("register",data);

        email.disabled = true;
        pass.disabled = true;
    });

    login.addEventListener('click',() =>{
        var data = {
            Email: email.value,
            Pass: pass.value,
        };
        window.api.send("login",data);

        //disable input onto the input boxes : email & pass
        email.disabled = true;
        pass.disabled = true;
    });

    window.api.receive("resetInput", _ => {
        //reset both input boxes from disabled to enabled.
        email.disabled = false;
        pass.disabled = false;
    });

    email.addEventListener('keypress' ,(key) => {
        //login when enter key was pressed
        console.log(key);

        if(key.key == 'Enter'){
            console.log("LOGINING!")
            var data = {
                Email: email.value,
                Pass: pass.value,
            };
            window.api.send("login",data);

            //disable input onto the input boxes : email & pass
            email.disabled = true;
            pass.disabled = true;
        }
    });

    pass.addEventListener('keypress' ,(key) => {
        //login when enter key was pressed
        console.log(key);

        if(key.key == 'Enter'){
            console.log("LOGINING!")
            var data = {
                Email: email.value,
                Pass: pass.value,
            };
            window.api.send("login",data);

            //disable input onto the input boxes : email & pass
            email.disabled = true;
            pass.disabled = true;
        }
    });
}