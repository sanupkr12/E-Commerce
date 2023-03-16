$(document).ready(init);

function init(){
    let $form = $("#login-form");
    $form.submit(handleLogin);
}

function handleLogin(event) {
    event.preventDefault();
    let $form = $("#login-form");
    let email = $form.find("#email").val();
    let password = $form.find("#password").val();
    if(!email || !password){
        return;
    }
    fetch('../data/credentials.json')
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
                        window.location.href="/public/html/cart.html";
                        return;
                    }
                    
                }
            }
                localStorage.setItem("untrackedItems",JSON.stringify([]));
                window.location.href="/public/html/products.html";
            }
        );
}

(function () {
    'use strict'
    var forms = $('.needs-validation');
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