$(document).ready(init);

function init(){
    $("#signup-form").submit(handleSignupSubmit);
}

function handleSignupSubmit(event){
    event.preventDefault(); 
    let $form = $("#signup-form");
    let email = $form.find("#email").val();
    let password = $form.find("#password").val();
    fetch("./data/credentials.json")
    .then(res=>res.json())
    .then(data=>{
        let credentials = data.credentials;
        credentials.push({email:email,password:password});
        download("credentials.json", JSON.stringify(credentials));
        localStorage.setItem("email", email);
            let cart = JSON.parse(localStorage.getItem("cart"));
            if (!cart) {
                let newCart = {};
                newCart["email"] = email;
                newCart["items"] = [];
                newCart = [newCart];
                localStorage.setItem("cart", JSON.stringify(newCart));
            }
            else {
                let flag = false;
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].email === email) {
                        flag = true;
                    }
                }

                if (!flag) {
                    cart.push({ "email": email, "items": [] });
                    localStorage.setItem("cart", JSON.stringify(cart));
                }
            }
            updateCartItemCount(email);
            $("#login")[0].style.display = "none";
            $("#logout-btn")[0].style.display = "block";
            window.location.href='/public/html/products';
    })
}