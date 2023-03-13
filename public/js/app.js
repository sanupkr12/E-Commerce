let page = 1;
let totalItem = 0;
let searchPage = 1;
let searchProducts = [];

const limit = 8;

$(document).ready(init);

function init() {
    fetch("../html/header.html")
        .then(
            res => res.text())
        .then(data => {
            $("header")[0].innerHTML = data;
            let email = localStorage.getItem("email");
            let untrackedItems = localStorage.getItem("untrackedItems");
            if (!email) {
                $("#cart-text")[0].value = untrackedItems!=null? untrackedItems.length : 0;
                $("#logout-btn")[0].style.display = "none";
                $("#login").click(handleLoginClick);
                if(window.location.href.split("/").pop()==='login.html'){
                    $("#login")[0].style.display = "none";
                    $("#go-to-cart-btn")[0].style.display = "none";
                }
            }
            else{
                fetch("../data/credentials.json")
                .then(res=>res.json())
                .then(data=>{
                    let credentials = data.credentials;
                    for(let i=0;i<credentials.length;i++){
                        if(credentials[i].email===email){
                            $("#user-detail-text")[0].innerHTML = `<i class="fa-solid fa-user mx-1"></i> ${credentials[i].username}`;
                            break;
                        }
                    }
                });
                
                $("#logout-btn").click(handleLogout);
                $("#login")[0].style.display = "none";
            }
            updateCartItemCount(email);
            
            $("#brand-logo").click(handleLogoClick);
            $("#go-to-cart-btn").click(()=>{window.location.href = "/public/html/cart.html";});
            $("#file-upload-btn").click(()=>{window.location.href = "/public/html/upload.html"});
            const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            if(!email){
                $(".dropdown")[0].style.display = "none";
                $("#file-upload-btn")[0].style.display = "none";
            }
        });

    numberValidation();
    fetch("../html/footer.html")
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
        window.location.href="/public/html/login.html";
}

function handleSignup(){
    window.location.href="/public/html/signup.html";
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
    Window.location.href="/public/html/order.html";
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
    let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
    email = localStorage.getItem("email");
    if(!email){
        let cart = untrackedItems!=null ? untrackedItems : []; 
        fetch("../data/products.json")
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
        untrackedItems = results;
        localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        $("#cart-text")[0].innerText = results.length;
    });
    }
    else{
        let index = 0;
    for (let i = 0; i < cartEntry.length; i++) {
        if (cartEntry[i].email == email) {
            index = i;
            break;
        }
    }
    let cart = cartEntry[index].items;
    
    fetch("../data/products.json")
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
}

function handleLogoClick() {
    window.location.href= "/public/html/products.html";
}

function handleAddToCart(event) {
    let email = localStorage.getItem("email");
    if (event.target.innerText === "Go to Cart") {
        window.location.href="/public/html/cart.html";
        return;
    }

    let id = parseInt($("#product-id")[0].value);
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
    let oldQuantity = 0;
    let index = 0;
    let items = [];

    if(!email){
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let itemCount = untrackedItems.length;
        let cart = untrackedItems;
        let index1 = 0;
        let flag = false;
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id === id) {
                flag = true;
                oldQuantity = parseInt(item.quantity);
                index1 = i;
            }
        }
        let quantity = parseInt($("#input-quantity")[0].value);
        if (flag === true) {
            cart[index1] = { "id": id, "quantity": quantity };
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        }
        else {
            cart.push({ id, quantity });
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
            itemCount += 1;
        }
    
        $("#cart-text")[0].innerText = itemCount;
        $(".addToCartBtn")[0].innerText = "Go to Cart";
    }
    else{
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

function increaseQuantity(id,event) {
    event.preventDefault();
    event.stopPropagation();
    let quantity = parseInt($("#input-quantity")[0].value);
    $("#input-quantity")[0].value = quantity + 1;
    let email = localStorage.getItem('email');
    if(!email){
        let index2 = 0;
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let cart = untrackedItems;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                break;
            }
        }
        cart[index2].quantity+=1;
        localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
    }
    else{
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
        localStorage.setItem("cart", JSON.stringify(cartEntry));
    }
}

function decreaseQuantity(id,event) {
    event.preventDefault();
    event.stopPropagation();
    let quantity = parseInt($("#input-quantity")[0].value);
    $("#input-quantity")[0].value = quantity - 1;
    let email = localStorage.getItem("email");
    if(!email){
        let index2 = 0;
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let cart = untrackedItems;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                break;
            }
        }
        cart[index2].quantity-=1;
        if(cart[index2].quantity<=0){
            cart.items = cart.items.filter(item => item.id!== id);
            localStorage.setItem("untrackedItems", JSON.stringify(cart));
            updateCartItemCount(email);
            location.reload();
            return;
        }
        localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
    }
    else{
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
        localStorage.setItem("cart", JSON.stringify(cartEntry));
    }
    
}

function increaseQuantityOnProduct(id,event) {
    event.preventDefault();
    event.stopPropagation();
    let quantity = parseInt($(`#input-${id}`)[0].value);
    $(`#input-${id}`)[0].value = quantity + 1;
    let email = localStorage.getItem('email');
    if(!email){
        let index2 = 0;
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let cart = untrackedItems;
        let flag=false;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                flag=true;
                index2 = i;
                break;
            }
        }
        if(flag === false){
            cart.push({id,quantity:1});
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        }
        else{
            cart[index2].quantity+=1;
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        }
    }
    else{
        let cartEntry = JSON.parse(localStorage.getItem("cart"));
        let index1 = 0;
        for (let j = 0; j < cartEntry.length; j++) {
            if (cartEntry[j].email === email) {
                index1 = j;
                break;
            }
        }
        let index2 = 0;
        let flag = false;
        let cart = cartEntry[index1].items;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                flag = true;
                break;
            }
        }
        if(flag === false){
            cart.push({id,quantity:1});
            localStorage.setItem('cart', JSON.stringify(cartEntry));
        }
        else{
            cart[index2].quantity+=1;
            localStorage.setItem("cart", JSON.stringify(cartEntry));
        }
        
    }
    updateCartItemCount(email);
}

function decreaseQuantityOnProduct(id,event) {
    event.preventDefault();
    event.stopPropagation();
    let quantity = parseInt($(`#input-${id}`)[0].value);
    $(`#input-${id}`)[0].value = quantity - 1;
    let email = localStorage.getItem("email");
    if(!email){
        let index2 = 0;
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let cart = untrackedItems;
        let flag = false;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                flag = true;
                break;
            }
        }

        if(flag === false){
            return;
        }
        cart[index2].quantity-=1;
        if(cart[index2].quantity<=0){
            cart.items = cart.items.filter(item => item.id!== id);
            localStorage.setItem("untrackedItems", JSON.stringify(cart));
            updateCartItemCount(email);
            location.reload();
            return;
        }
        localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
    }
    else{
        let cartEntry = JSON.parse(localStorage.getItem("cart"));
        let index1 = 0;
        for (let j = 0; j < cartEntry.length; j++) {
            if (cartEntry[j].email === email) {
                index1 = j;
                break;
            }
        }

        let index2 = 0;
        let flag = false;
        let cart = cartEntry[index1].items;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                flag = true;
                break;
            }
        }
        if(flag === false){
            return;
        }
        cart[index2].quantity-=1;
        if(cart[index2].quantity<=0){
            cartEntry[index1].items = cartEntry[index1].items.filter(item => item.id!== id);
            localStorage.setItem("cart", JSON.stringify(cartEntry));
            updateCartItemCount(email);
            location.reload();
            return;
        }
        localStorage.setItem("cart", JSON.stringify(cartEntry));
    }
    updateCartItemCount(email);
}

function updateCart(id,quantity){
    let email = localStorage.getItem("email");
    if(!email){
        let index2 = 0;
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let cart = untrackedItems;
        let flag = false;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                flag = true;
                break;
            }
        }

        if(flag === false){
            cart.push({id,quantity});
        }
        else{
            cart[index2] = {id,quantity};
        }
        localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
    }
    else{
        let cartEntry = JSON.parse(localStorage.getItem("cart"));
        let index1 = 0;
        for (let j = 0; j < cartEntry.length; j++) {
            if (cartEntry[j].email === email) {
                index1 = j;
                break;
            }
        }

        let index2 = 0;
        let flag = false;
        let cart = cartEntry[index1].items;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                flag = true;
                break;
            }
        }
        if(flag === false){
            cart.push({id,quantity});
            return;
        }
        else{
            cart[index2] = {id,quantity};
        }
        localStorage.setItem("cart", JSON.stringify(cartEntry));
    }
    updateCartItemCount(email);
}

function handleLogout() {
    localStorage.removeItem("email");
    window.location.href = "/public/html/login.html";
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

