const limit = 8;
let page = 1;
let totalItem = 0;
let searchPage = 1;
let searchProducts = [];

$(document).ready(init);

function init() {
    fetch("/html/header.html")
        .then(
            res => res.text())
        .then(data => {
            $("header")[0].innerHTML = data;
            let email = localStorage.getItem("email");
            if (!email) {
                $("#cart-text")[0].value = "0";
                $("#logout-btn")[0].style.display = "none";
            }
            else {
                updateCartItemCount(email);
                $("#user-detail-text")[0].innerText = email.split("@")[0];
                $("#logout-btn").click(handleLogout);
                $("#login")[0].style.display = "none";
            }
            $("#login").click(handleLoginClick);
            $("#brand-logo").click(handleLogoClick);
            $("#go-to-cart-btn").click(()=>{window.location.href = "http://localhost:3000/cart";});
            $("#file-upload-btn").click(()=>{window.location.href = "http://localhost:3000/order"});
            const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            if(!email){
                $(".dropdown")[0].style.display = "none";
                $("#file-upload-btn")[0].style.display = "none";
            }
        });
    validateLogin();
    numberValidation();
    fetch("/html/footer.html")
        .then(
            res => res.text())
        .then(data => {
            $("footer")[0].innerHTML = data;
            let date = new Date();
            $("#footer-text")[0].innerText = "Copyright @Increff 2023, " + String(date).substr(0, 25);
            setInterval(() => {
                let date = new Date();
                $("#footer-text")[0].innerText = "Copyright @Increff 2023, " + String(date).substr(0, 25);
            }, 5000);   
        });   
}

function handleLoginClick(){
        $("#signup")[0].style.display = "block";
        $("#login")[0].style.display = "none";
        window.location.href="http://localhost:3000/login";
}

function handleSignup(){
    window.location.href="http://localhost:3000/signup";
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();  
    document.body.removeChild(element);
}
  
function handleFileUpload(){
    Window.location.href="http://localhost:3000/order";
}

function toJson($form) {
    let serialized = $form.serializeArray();
    console.log(serialized);
    let s = '';
    let data = {};
    for (s in serialized) {
        data[serialized[s]['name']] = serialized[s]['value']
    }
    let json = JSON.stringify(data);
    return json;
}

function updateCartItemCount(email){
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
    let index = 0;
    for (let i = 0; i < cartEntry.length; i++) {
        if (cartEntry[i].email == email) {
            index = i;
            break;
        }
    }
    let cart = cartEntry[index].items;
    
    fetch("/data/products.json")
    .then(res=>res.json())
    .then(data=>{
        let products = data.products;
        let results = [];
        for(let i=0; i < cart.length; i++) {
            let flag = false;
            for(let j=0;j<products.length;j++) {
                if(products[j].id === cart[i].id && cart[i].quantity > 0) {
                    flag = true;
                }
                
            }
            if(flag){
                results.push({id:cart[i].id,quantity:cart[i].quantity});
            }
        }
        cartEntry[index].items = results;
        localStorage.setItem("cart", JSON.stringify(cartEntry));
        $("#cart-text")[0].innerText = results.length;
    });
    
}

function validateLogin() {
    let email = localStorage.getItem("email");
    if(window.location.href.split("/").pop() != 'login'){
        if (!email) {
            window.location.href = "http://localhost:3000/login";
        }
    }
}

function handleLogoClick() {
    window.location.href= "http://localhost:3000/products";
}

function decreaseQuantityOnCart(id,price,event){
    event.stopPropagation();
    let email = localStorage.getItem("email");
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
    let index1 = 0;
    for (let j = 0; j < cartEntry.length; j++) {
        if (cartEntry[j].email === email) {
            index1 = j;
            break;
        }
    }

    let index2 = 0;
    let cart = cartEntry[index1].items;
    for(let i=0; i < cart.length; i++) {
        if(cart[i].id===id){
            index2 = i;
            break;
        }
    }
    cart[index2].quantity-=1;
    if(cart[index2].quantity<=0){
        cartEntry[index1].items = cartEntry[index1].items.filter(item => item.id!== id);
        localStorage.setItem("cart", JSON.stringify(cartEntry));
        updateCartItemCount(email);
        location.reload();
        return;
    }
    let orgPrice = parseInt($("#total-bill")[0].innerText);
    $("#total-bill")[0].innerText = (orgPrice - parseInt(price));
    localStorage.setItem("cart", JSON.stringify(cartEntry));
    $(`#input-`+id)[0].value = cart[index2].quantity;
}

function increaseQuantityOnCart(id,price,event){
    event.stopPropagation();
    let email = localStorage.getItem("email");
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
    let index1 = 0;
    for (let j = 0; j < cartEntry.length; j++) {
        if (cartEntry[j].email === email) {
            index1 = j;
            break;
        }
    }
    let index2 = 0;
    let cart = cartEntry[index1].items;
    for(let i=0; i < cart.length; i++) {
        if(cart[i].id===id){
            index2 = i;
            break;
        }
    }
    cart[index2].quantity+=1;
    let orgPrice = parseInt($("#total-bill")[0].innerText);
    $("#total-bill").text(orgPrice + parseInt(price));;
    localStorage.setItem("cart", JSON.stringify(cartEntry));
    $(`#input-`+id)[0].value = cart[index2].quantity;
}

function handleAddToCart(event) {
    if (event.target.innerText === "Go to Cart") {
        window.location.href="http://localhost:3000/cart";
        return;
    }
    let id = parseInt($("#product-id")[0].value);
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
    let oldQuantity = 0;
    let index = 0;
    let items = [];
    let email = localStorage.getItem("email");
    for (let j = 0; j < cartEntry.length; j++) {
        if (cartEntry[j].email === email) {
            items = cartEntry[j].items;
            index = j;
            break;
        }
    }
    let itemCount = cartEntry[index].items.length;
    let cart = items;
    let index1 = 0;
    let flag = false;
    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        if (item.id === id) {
            flag = true;
            oldQuantity = parseInt(item.quantity);
            index1 = i;
        }
    }
    let quantity = parseInt($("#input-quantity")[0].value);
    if (flag === true) {
        cartEntry[index][index1] = { "id": id, "quantity": quantity };
        localStorage.setItem("cart", JSON.stringify(cartEntry));
    }
    else {
        cartEntry[index].items.push({ id, quantity });
        localStorage.setItem("cart", JSON.stringify(cartEntry));
        itemCount += 1;
    }

    $("#cart-text")[0].innerText = itemCount;
    $(".addToCartBtn")[0].innerText = "Go to Cart";
}

function toJson($form) {
    let serialized = $form.serializeArray();
    let s = '';
    let data = {};
    for (s in serialized) {
        data[serialized[s]['name']] = serialized[s]['value']
    }
    let json = JSON.stringify(data);
    return json;
}

function increaseQuantity(event) {
    event.preventDefault();
    let quantity = parseInt($("#input-quantity")[0].value);
    $("#input-quantity")[0].value = quantity + 1;
}

function decreaseQuantity(event) {
    event.preventDefault();
    let quantity = parseInt($("#input-quantity")[0].value);
    if (quantity <= 1) {
        return;
    }
    $("#input-quantity")[0].value = quantity - 1;
}

function handleLogout() {
    localStorage.removeItem("email");
    validateLogin();
}

function numberValidation() {
    let ele = document.querySelectorAll('.num-input');
    if (ele.length === 0) {
        return;
    }
    else {
        for (let i = 0; i < ele.length; i++) {
            ele[i].onkeypress = function (evt) {
                if (evt.which != 8 && evt.which != 0 && evt.which != 46 && evt.which < 48 || evt.which > 57) {
                    evt.preventDefault();
                }
            };
        }
    }
}
