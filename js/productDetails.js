const $removeItemModal = $("#remove-item-modal");
const $successToast = $("#success-toast");
const $errorToast = $("#error-toast");

$(document).ready(init);

function init(){
    let url = new URLSearchParams(window.location.search);
    let id = url.get('id');
    $("#input-quantity").on('change',handleInputQuantityChange);
    showProductDetails(id);
    $removeItemModal.find("#remove-item").click(removeItem);
    $removeItemModal.find("#close-modal").click(closeModal);
    $errorToast.click(()=>{$errorToast.hide()});
}

function closeModal(){$removeItemModal.modal('toggle');}

function removeItem(event){
    event.preventDefault();
    let email = localStorage.getItem("email");
    let id = $("#item-id").val();
    if(!email){
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let cart = untrackedItems;
        cart.items = cart.items.filter(item => item.id!= id);
        localStorage.setItem("untrackedItems", JSON.stringify(cart));
        updateCartItemCount(email);
        location.reload();
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
        cartEntry[index1].items = cartEntry[index1].items.filter(item => item.id!= id);
        localStorage.setItem("cart", JSON.stringify(cartEntry));
        updateCartItemCount(email);
        location.reload();
    }
}

function handleInputQuantityChange(event){
    event.preventDefault();
    let url = new URLSearchParams(window.location.search);
    let id = url.get('id');
    let quantity = parseInt(event.target.value);
    if(quantity < 0){
        alert("Quantity cannot be negative");
        return;
    }
    else{
        updateCart(id,quantity);
    }
}

function showProductDetails(id) {
    if(id==='undefined' || !id){
        window.location.href = "/html/products.html";
        return;
    }
    fetch("../assets/data/products.json")
    .then((response) => response.json())
    .then((json) => {
        let products = json.products;
        let product = products.find(product => product.id == id);
        let cartEntry = JSON.parse(localStorage.getItem("cart"));
        let email = localStorage.getItem("email");
        let index = 0;
        for(let i=0;i<(cartEntry!=null?cartEntry.length:0);i++){
            if(cartEntry[i].email === email){
                index = i;
                break;
            }
        }
        $("#product-title")[0].innerText = product.title;
        $("#product-price")[0].innerText = "₹ " + product.price;
        $("#product-description")[0].innerText = product.description;
        $("#product-brand")[0].innerText = product.brand;
        let images = product.images;
        let imageHtml = "";
        let carouselIndicatorHtml = "";
        for (let i = 0; i < images.length; i++) {
            if (i === 0) {
                imageHtml += `<div class="carousel-item active">
            <img src="${images[i]}" class="d-block w-100 carousel-image" alt="...">
        </div>`;
                carouselIndicatorHtml+=`<button data-bs-target="#carouselExampleDark" data-bs-slide-to="${i}" class="active" aria-current="true" aria-label="Slide ${i}"></button>`;
            }
            else {
                imageHtml += `<div class="carousel-item">
            <img src="${images[i]}" class="d-block w-100 carousel-image" alt="...">
        </div>`;
                carouselIndicatorHtml+=`<button data-bs-target="#carouselExampleDark" data-bs-slide-to="${i}" aria-label="Slide ${i}"></button>`;
            }
        }
        $("#product-images")[0].innerHTML = imageHtml;
        $(".carousel-indicators")[0].innerHTML = carouselIndicatorHtml;
        $("#increase-quantity").click((event)=>{increaseQuantity(id,event)});
        $("#decrease-quantity").click((event)=>{decreaseQuantity(id,product.title,event)});
        $(".addToCart").click(addProduct);
        $("#product-id")[0].value = id;
        if(!email){
            let cart = JSON.parse(localStorage.getItem("untrackedItems"));
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].id == id) {
                    $("#input-quantity").val(cart[i].quantity);
                    $(".addToCart")[0].innerText = "GO TO CART";
                    break;
                }
            }
            return;
        }
        else{
            let cart = cartEntry[index];
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].id == id) {
                    $("#input-quantity").val(cart.items[i].quantity);
                    $(".addToCart")[0].innerText = "GO TO CART";
                    break;
                }
            }
        }   
    }).catch(error=>{
        $errorToast.find(".toast-body").innerText = error.message;
        $errorToast.show();
    });
}

function addProduct(event){
    event.stopPropagation();
    if(event.target.innerText === "GO TO CART"){
        let cartEntry = JSON.parse(localStorage.getItem("cart"));
        let email = localStorage.getItem("email");
        let url = new URLSearchParams(window.location.search);
        let id = url.get('id');
        let index = 0;
        for(let i=0;i<cartEntry.length;i++){
            if(cartEntry[i].email === email){
                index = i;
                break;
            }
        }
        let cart = cartEntry[index];
        let index2 = 0;
        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].id == id) {
                index2 = i;
                break;
            }
        }
        let newQuantity = parseInt($("#input-quantity")[0].value);
        cart.items[index2].quantity = newQuantity;
        localStorage.setItem("cart",JSON.stringify(cartEntry));
        window.location.href="/html/cart.html";
        return;
    }
    let cart = JSON.parse(localStorage.getItem('cart'));
    let email = localStorage.getItem('email');
    let index1 = 0;
    for(let i = 0; i < cart.length; i++) {
        if(cart[i].email===email){
            index1 = i;
            break;
        }
    }
    let items = cart[index1].items;
    let flag = false;
    let index2 = 0;
    let url = new URLSearchParams(window.location.search);
    let id = parseInt(url.get('id'));
    for(let i=0; i < items.length; i++) {
        if(items[i].id==id){
            flag = true;
            index2 = i;
            break;
        }
    }
    let quantity = parseInt($("#input-quantity")[0].value);
    if(quantity<=0){
        return;
    }
    if(flag)
    {
        items[index2].quantity+=quantity;
    }
    else{
        items.push({id:id,quantity:quantity});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartItemCount(email);
    $successToast.find(".toast-body")[0].innerText = "Product added to cart";
    $successToast.toast("show");
    event.target.innerText = "GO TO CART";
}