window.onload = function() {
    var close = document.getElementById("close");
    
    close.addEventListener('click',() =>{
        window.api.send("close");
    });
}