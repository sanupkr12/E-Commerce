$(document).ready(init);

function init(){
    let id = window.location.href.split("/").pop();
    $("#input-quantity").on('change',handleInputQuantityChange);
    showProductDetails(id);
}

function handleInputQuantityChange(event){
    event.preventDefault();
    let id = window.location.href.split("/").pop();
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
    fetch("/data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
            let product = products.find(product => product.id == id);
            let cartEntry = JSON.parse(localStorage.getItem("cart"));
            let email = localStorage.getItem("email");
            let index = 0;
            for(let i=0;i<cartEntry.length;i++){
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
            $("#decrease-quantity").click((event)=>{decreaseQuantity(id,event)});
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
            
        });
}

function addProduct(event){
    event.stopPropagation();
    if(event.target.innerText === "GO TO CART"){
        let cartEntry = JSON.parse(localStorage.getItem("cart"));
        let email = localStorage.getItem("email");
        let id = window.location.href.split("/").pop();
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
        window.location.href="http://localhost:3000/cart";
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
    let id = parseInt(window.location.href.split("/").pop());
    for(let i=0; i < items.length; i++) {
        if(items[i].id===id){
            flag = true;
            index2 = i;
            break;
        }
    }
    let quantity = parseInt($("#input-quantity")[0].value);
    if(flag)
    {
        items[index2].quantity+=quantity;
    }
    else{
        cart[index1].items.push({id:id,quantity:quantity});
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartItemCount(email);
    $(".toast-body")[0].innerText = "Product added to cart";
    $("#success-toast").toast("show");
    event.target.innerText = "GO TO CART";
}