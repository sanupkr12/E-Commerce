$(document).ready(init);

function init(){
    let $form = $("#login-form");
    $form.submit(handleLogin);
    $("#error-toast").click(()=>{$('#error-toast').hide()});
}

function handleLogin(event) {
    event.preventDefault();
    let $form = $("#login-form");
    let email = $form.find("#email").val();
    let password = $form.find("#password").val();
    fetch('/data/credentials.json')
        .then(
            (response) => response.json()
        )
        .then(
            (json) => {
                let credentials = json.credentials;
                let flag = false;
                for (let i = 0; i < credentials.length; i++) {
                    if (credentials[i].email === email && credentials[i].password === password) {
                        flag = true;
                        break;
                    }
                }

                if (!flag) {
                    $(".toast-body")[0].innerText = "Invalid email or password";
                    $("#error-toast").show();
                    return;
                }
                else {
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

                    window.location.href="http://localhost:3000/products";
                }
            }
        );
}