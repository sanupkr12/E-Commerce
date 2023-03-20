const $form = $("#login-form"),
$errorToast = $("#error-toast");

$(document).ready(init);

function init(){
    $form.submit(handleLogin);
    $errorToast.click($errorToast.hide());
}

function handleLogin(event) {
    event.preventDefault();
    const email = $form.find("#email").val();
    const password = $form.find("#password").val();
    if(!email || !password){
        return;
    }
    fetch('../assets/data/credentials.json')
    .then(
        (response) => response.json()
        //promise was awaiting so we need to await for a response
    )
    .then(
        (json) => {
            const credentials = json.credentials;
            let flag = false;
            for (let i = 0; i < credentials.length; i++) {
                if (credentials[i].email === email && credentials[i].password === password) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                $("#error-box")[0].innerText = "Invalid email or password";
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
                    cart = newCart;
                }
                    
                let flag = false;
                let index = 0;
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].email === email) {
                        flag = true;
                        index = i;
                        break;
                    }
                }
                let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
                if (!flag) {
                    cart.push({ "email": email, "items": [...untrackedItems] });
                    localStorage.setItem("cart", JSON.stringify(cart));
                }
                else{
                    for(let i=0;i<untrackedItems.length;i++){
                        let flag = false;
                        let index2 = 0;
                        for(let j=0;j<cart[index].items.length;j++){
                            if(untrackedItems[i].id == cart[index].items[j].id){
                                flag = true;
                                index2 = j;
                                break;
                            }
                        }
                        if(flag){
                            cart[index].items[index2].quantity += untrackedItems[i].quantity;
                        }
                        else{
                            cart[index].items.push(untrackedItems[i]);
                        }
                    }
                    if(untrackedItems.length >0){
                        localStorage.setItem("cart", JSON.stringify(cart));
                        localStorage.setItem("untrackedItems",JSON.stringify([]));
                        window.location.href="/html/cart.html";
                        return;
                    }
                    
                }
            }
                localStorage.setItem("untrackedItems",JSON.stringify([]));
                window.location.href="/html/products.html";
            }
        ).catch((error)=>{
            $errorToast.find(".toast-body")[0].innerText = error;
            $errorToast.show();
        });
}

(function () {
    'use strict'
    const forms = $('.needs-validation');
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
          form.classList.add('was-validated')
        }, false)
      })
  })()