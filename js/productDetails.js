const $removeItemModal = $("#remove-item-modal"),
$successToast = $("#success-toast"),
$successBody = $successToast.find(".toast-body"),
$errorToast = $("#error-toast"),
$errorBody = $errorToast.find(".toast-body");

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
    const email = localStorage.getItem("email");
    const id = $("#item-id").val();
    if(!email){
        let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
        let cart = untrackedItems;
        cart.items = cart.items.filter(item => item.id!= id);
        localStorage.setItem("untrackedItems", JSON.stringify(cart));
        updateCartItemCount(email);
        location.reload();
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
            cartEntry[index1].items = cartEntry[index1].items.filter(item => item.id!= id);
            localStorage.setItem("cart", JSON.stringify(cartEntry));
            updateCartItemCount(email);
            location.reload();
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        } 
    }
}

function handleInputQuantityChange(event){
    event.preventDefault();
    let url = new URLSearchParams(window.location.search);
    let id = url.get('id');
    const quantity = parseInt(event.target.value);
    if(quantity < 0){
        $errorBody[0].innerText = "Quantity cannot be negative.";
        $errorToast.show();
        return;
    }
    else{
        updateCart(id,quantity);
        $successBody[0].innerText = "Quantity successfully updated";
        $successToast.show();
        setTimeout(()=>{$successToast.hide()},3000);
    }
}

function showProductDetails(id) {
    if(id==='undefined' || !id){
        window.location.href = "/html/products.html";
        return;
    }
    fetch("../assets/json/products.json")
    .then((response) => response.json())
    .then((json) => {
        const products = json.products;
        let product = products.find(product => product.id == id);
        let cartEntry = JSON.parse(localStorage.getItem("cart"));
        const email = localStorage.getItem("email");
        let index = 0;
        for(let i=0;i<(cartEntry!=null?cartEntry.length:0);i++){
            if(cartEntry[i].email === email){
                index = i;
                break;
            }
        }
        $("#product-title")[0].innerText = product.title;
        $("#product-price")[0].innerHTML = `<p class="fs-5 fw-normal">₹${product.price.toLocaleString('en-IN')} <span class="ms-2 opacity-75 p-1 bg-secondary text-white rounded-1 fs-6"> ${product.rating} <i class="fa fa-solid fa-star text-warning"></i></span></p>`;
        $("#product-description")[0].innerText = product.description;
        $("#product-brand")[0].innerText = product.brand;
        const images = product.images;
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
        $("#product-id")[0].value = id;
        let flag = false;
        let quantity = 0;
        if(!email){
            let cart = JSON.parse(localStorage.getItem("untrackedItems"));
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].id == id) {
                    $("#btn-group")[0].innerHTML = `<button class="btn btn-warning" id="decrease-quantity">-</button>
                    <input type="number" value="0" min="0" id="input-quantity"
                        class="form-control d-inline num-input text-center mx-1">
                    <button class="btn btn-warning" id="increase-quantity">+</button>
                    <a class="d-block btn btn-secondary mt-3 ms-3 mb-3 px-3" href="../html/cart.html">GO TO CART</a>`;
                    flag = true;
                    quantity = cart[i].quantity;
                    break;
                }
            }
        }
        else{
            let cart = cartEntry[index];
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].id == id) {
                    $("#btn-group")[0].innerHTML = `<button class="btn btn-warning" id="decrease-quantity">-</button>
                    <input type="number" value="0" min="0" id="input-quantity"
                        class="form-control d-inline num-input text-center mx-1">
                    <button class="btn btn-warning" id="increase-quantity">+</button>
                    <a class="d-block btn btn-secondary mt-3 ms-3 mb-3 px-3" href="../html/cart.html">GO TO CART</a>`;
                    flag = true;
                    quantity = cart.items[i].quantity;
                    break;
                }
            }
        }
        if(flag) {
            $("#input-quantity").val(quantity);
            $("#input-quantity").keyup(handleInputQuantityChange);
            $("#increase-quantity").click((event)=>{increaseQuantity(id,event)});
            $("#decrease-quantity").click((event)=>{decreaseQuantity(id,product.title,event)});
        }
        $(".addToCart").click(addProduct); 
    }).catch(error=>{
        $errorBody.innerText = error.message;
        $errorToast.show();
    });
}

function addProduct(event){
    event.stopPropagation();
    let url = new URLSearchParams(window.location.search);
    let id = parseInt(url.get('id'));
    const email = localStorage.getItem('email');
    if(!email){
        let untrackedItems = JSON.parse(localStorage.getItem('untrackedItems'));
        untrackedItems.push({"id":parseInt(id),"quantity":1});
        localStorage.setItem('untrackedItems',JSON.stringify(untrackedItems));
    }
    else{
        let cart = JSON.parse(localStorage.getItem('cart'));
        let index = -1;
        for(let i=0;i<cart.length;i++){
            if(cart[i].email === email){
                index = i;
                break;
            }
        }
        cart[index].items.push({"id":parseInt(id),"quantity":1});
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    $("#btn-group")[0].innerHTML = `<button class="btn btn-warning" id="decrease-quantity">-</button>
    <input type="number" value="0" min="0" id="input-quantity"
        class="form-control d-inline num-input text-center mx-1">
    <button class="btn btn-warning" id="increase-quantity">+</button>
    <a class="d-block btn btn-secondary mt-3 ms-3 mb-3 px-3" href="../html/cart.html">GO TO CART</a>`;

    $("#input-quantity").val(1);
    $("#input-quantity").keyup(handleInputQuantityChange);
    $("#increase-quantity").click((event)=>{increaseQuantity(id,event)});
    let title = $("#product-title")[0].innerText;
    $("#decrease-quantity").click((event)=>{decreaseQuantity(id,title,event)});
    updateCartItemCount(email);
    $successBody[0].innerText = "Item added successfully";
    $successToast.show();
    setTimeout(()=>{$successToast.hide()},3000);
}