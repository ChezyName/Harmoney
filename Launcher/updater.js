window.onload = function() {
    var pT = document.getElementById("percentage");
    var pB = document.getElementById("Bar");
    var text = document.getElementById("Text");

    window.api.receive("persentage",(args) => {
        console.log(args + "%");
        pT.innerHTML = args + "%";
        pB.value = args;
    });

    window.api.receive("text",(args) => {
        text.innerHTML = args;
    });
}