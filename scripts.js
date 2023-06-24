document.addEventListener("DOMContentLoaded",main);
function main(){
    const email = document.getElementsByClassName("copy")[0];
    const phone = document.getElementsByClassName("copy")[1];
    email.addEventListener("click",copyThis);
    phone.addEventListener("click",copyThis);

    function copyThis(){
        let target = event.target.getAttribute("alt");
        navigator.clipboard.writeText(target);
    }
}