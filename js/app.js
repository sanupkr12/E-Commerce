let page = 1,
totalItem = 0,
searchPage = 1,
searchProducts = [];
const limit = 8;

$(document).ready(init);

function init() {
    fetch("../html/header.html")
    .then(
        res => res.text())
    .then(data => {
        $("header")[0].innerHTML = data;
        const email = localStorage.getItem("email");
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
            fetch("../assets/data/credentials.json")
            .then(res=>res.json())
            .then(data=>{
                const credentials = data.credentials;
                for(let i=0;i<credentials.length;i++){
                    if(credentials[i].email===email){
                        $("#user-detail-text")[0].innerHTML += `${credentials[i].username}`;
                        break;
                    }
                }
            });
            $("#logout-btn").click(handleLogout);
            $("#login")[0].style.display = "none";
        }
        updateCartItemCount(email);
        validateUser();
        $("#brand-logo").click(handleLogoClick);
        $("#go-to-cart-btn").click(()=>{window.location.href = "/html/cart.html";});
        $("#file-upload-btn").click(()=>{window.location.href = "/html/upload.html"});
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

function validateUser(){
    fetch("../assets/data/credentials.json")
    .then(res=>res.json())
    .then(json=>{
        const users = json.credentials;
        let cart = JSON.parse(localStorage.getItem('cart'));
        const email = localStorage.getItem('email');
        let validUsers = [];
        let userPresent = false;
        for(let i=0;i<cart.length;i++){
            if(cart[i].email === email){
                userPresent = true;
            }
            let flag = false;
            for(let j=0;j<users.length;j++){
                if(cart[i].email===users[j].email){
                    flag = true;
                    break;
                }
            }
            if(flag === true){
                validUsers.push(cart[i]);
            }
        }
        if(userPresent===false){
            validUsers.push({"email":email,"items":[]});
        }
        localStorage.setItem('cart', JSON.stringify(validUsers));
    }).catch(error=>{
        $errorToast.find(".toast-body")[0].innerText = error.message;
        $errorToast.show();
    });
}

function handleLoginClick(){window.location.href="/html/login.html";}

function handleSignup(){window.location.href="/html/signup.html";}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();  
    document.body.removeChild(element);
}
  
function handleFileUpload(){Window.location.href="/html/order.html";}

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

function updateCartItemCount(email){
    email = localStorage.getItem("email");
    if(!email){
        try{
            let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
            let cart = untrackedItems!=null ? untrackedItems : []; 
            fetch("../assets/data/products.json")
            .then(res=>res.json())
            .then(data=>{
                let products = data.products;
                let results = [];
                for(let i=0; i < cart.length; i++) {
                    let flag = false;
                    for(let j=0;j<products.length;j++) {
                        if(products[j].id === cart[i].id && cart[i].quantity > 0) {
                            flag = true;
                            break;
                        }     
                    }
                    if(flag){
                        results.push({id:cart[i].id,quantity:cart[i].quantity});
                    }
                }
                untrackedItems = results;
                localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
                $("#cart-text")[0].innerText = results.length;
            })
            .catch((error) => {
                $errorToast.find(".toast-body").innerText = error.message;
                $errorToast.show();
            });
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        } 
    }
    else{
        try{
            let cartEntry = JSON.parse(localStorage.getItem("cart"));
            let index = 0;
            let flag = false;
            for (let i = 0; i < cartEntry.length; i++) {
                if (cartEntry[i].email == email) {
                    index = i;
                    flag = true;
                    break;
                }
            }
            if(flag===false){
                cartEntry.push({"email":email,"items":[]});
                index = cartEntry.length - 1;
            }
            let cart = cartEntry[index].items;
            fetch("../assets/data/products.json")
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
            })
            .catch((error) => {
                $errorToast.find(".toast-body").innerText = error.message;
                $errorToast.show();
            });
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
    }
}

function handleLogoClick() {window.location.href= "/html/products.html";}

function handleAddToCart(event) {
    const email = localStorage.getItem("email");
    if (event.target.innerText === "Go to Cart") {
        window.location.href="/html/cart.html";
        return;
    }
    let id = parseInt($("#product-id")[0].value);
    let oldQuantity = 0;
    let index = 0;
    let items = [];
    if(!email){
        try{
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
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        try{
            let cartEntry = JSON.parse(localStorage.getItem("cart"));
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
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
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
    const email = localStorage.getItem('email');
    if(!email){
        let index2 = 0;
        try{
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
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        try{
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
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
    }
}

function decreaseQuantity(id,title,event) {
    event.preventDefault();
    event.stopPropagation();
    let quantity = parseInt($("#input-quantity")[0].value);
    if(quantity<=0){
        return;
    }
    const email = localStorage.getItem("email");
    if(!email){
        let index2 = 0;
        try{
            let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
            let cart = untrackedItems;
            for(let i=0; i < cart.length; i++) {
                if(cart[i].id==id){
                    index2 = i;
                    break;
                }
            }
            cart[index2].quantity-=1;
            if(cart[index2].quantity<=0){
                $("#item-id").val(id);
                $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong>?`;
                $("#remove-item-modal").modal('toggle');
                return;
            }
            $("#input-quantity")[0].value = quantity - 1;
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        try{
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
                if(cart[i].id==id){
                    index2 = i;
                    break;
                }
            }
            cart[index2].quantity-=1;
            if(cart[index2].quantity<=0){
                $("#item-id")[0].value = id;
                $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong>?`;
                $("#remove-item-modal").modal('toggle');
                return;
            }
            $("#input-quantity")[0].value = quantity - 1;
            localStorage.setItem("cart", JSON.stringify(cartEntry));
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
    }
}

function increaseQuantityOnProduct(id,event) {
    event.preventDefault();
    event.stopPropagation();
    let quantity = parseInt($(`#input-${id}`)[0].value);
    $(`#input-${id}`)[0].value = quantity + 1;
    const email = localStorage.getItem('email');
    if(!email){
        let index2 = 0;
        try{
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
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        try{
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
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
    }
    $("#success-toast .toast-body")[0].innerText = 'Item added successfully';
    $("#success-toast").toast('show');
    updateCartItemCount(email);
}

function decreaseQuantityOnProduct(id,event) {
    event.preventDefault();
    event.stopPropagation();
    let quantity = parseInt($(`#input-${id}`)[0].value);
    let title = $(event.target).closest('.card').find('.card-title')[0].innerText;
    if(quantity<=0){
        return;
    }
    const email = localStorage.getItem("email");
    if(!email){
        let index2 = 0;
        try{
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
                $("#item-id").val(id);
                $("#modal-description")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong>?`;
                $("#remove-item-modal").modal('toggle');
                return;
            }
            $(`#input-${id}`)[0].value = quantity - 1;
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        try{
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
                $("#item-id").val(id);
                $("#modal-description")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong>?`;
                $("#remove-item-modal").modal('toggle');
                return;
            }
            $(`#input-${id}`)[0].value = quantity - 1;
            localStorage.setItem("cart", JSON.stringify(cartEntry));
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
    }
    updateCartItemCount(email);
}

function removeItemFromCart(event){
    event.preventDefault();
    const email = localStorage.getItem("email");
    let id = $("#item-id")[0].value;
    if(!email){
        try{
            let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
            let cart = untrackedItems;
            cart.items = cart.items.filter(item => item.id!= id);
            localStorage.setItem("untrackedItems", JSON.stringify(cart));
            updateCartItemCount(email);
            location.reload();
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        try{
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
            cartEntry[index1].items = cartEntry[index1].items.filter(item => item.id!= id);
            localStorage.setItem("cart", JSON.stringify(cartEntry));
            updateCartItemCount(email);
            location.reload();
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
    }
}

function updateCart(id,quantity){
    const email = localStorage.getItem("email");
    if(!email){
        let index2 = 0;
        try{
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
        }catch(error){
            localStorage.setItem("untrackedItems", JSON.stringify([]));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        try{
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
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body").innerText = error.message;
            $errorToast.show();
        }
    }
    updateCartItemCount(email);
}

function handleLogout() {
    localStorage.removeItem("email");
    let filter = {"brand":[], "rating":[],"price":{"min":0,"max":1000000},"sort":{"phtl":0,"rhtl":0}};
    sessionStorage.setItem("filter",JSON.stringify(filter));
    window.location.href = "/html/login.html";
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

