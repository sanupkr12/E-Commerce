const $clearCartModal = $("#clear-cart-modal"),
$removeItemModal = $("#remove-item-modal"),
$errorToast = $("#error-toast"),
$errorBody = $errorToast.find(".toast-body"),
$checkoutButton = $("#checkout-btn"),
$totalCost = $("#total-cost"),
$totalBill = $("#total-bill"),
$emptyCartBox = $("#empty-cart-box"),
$emptyCartImage = $("#empty-cart-image");

$(document).ready(init);

function init(){
    $removeItemModal.find("#remove-item").click(removeFromCart); 
    $removeItemModal.find("#close-modal").click(closeModal);
    $clearCartModal.find("#close-clear-modal").click(()=>$clearCartModal.modal('toggle'));
    $errorToast.click(()=>{$errorToast.hide()});
    $("#clear-cart").click(handleClearCart);
    $("#remove-cart").click(clearCart);
    $("#redirect-box")[0].style.display = "none";
    manageCart();
}

function manageCart(){
    let results = [];
    const email = localStorage.getItem("email");
    updateCartItemCount(email);
    if(!email){
        try{
            let cart = JSON.parse(localStorage.getItem("untrackedItems"));
            fetch("../assets/json/products.json")
            .then((response) => response.json())
            .then((json) => {
                const products = json.products;
                for (let i = 0; i < products.length; i++) {
                    for (let j = 0; j < cart.length; j++) {
                        if (products[i].id === cart[j].id) {
                            if(typeof(cart[j].quantity)==='number' && cart[j].quantity>0)
                            {
                                results.push({ "product": products[i], "quantity": cart[j].quantity });
                            }
                        }
                    }
                }
                if (!results.length) {
                    $("#cart-div")[0].style.display = "none";
                    $("#bill-details")[0].style.display = "none";
                    $checkoutButton[0].style.display = "none";
                    return;
                }
                let price = 0;
                let productHtml = generateCartHtml(results);
                let totalItemCount = 0;
                for(let i=0;i<results.length;i++){
                    price += results[i].product.price * results[i].quantity;
                    totalItemCount+=results[i].quantity;
                }
                $emptyCartBox[0].style.display = "none";
                $totalBill[0].innerText = price;
                $totalCost[0].innerText = parseInt(price + 100);
                $("#cart-quantity")[0].innerHTML = totalItemCount > 1 ? `(${totalItemCount} items)` : `(${totalItemCount} item)`;
                $("#cart-items")[0].innerHTML = productHtml;
                $("#address-box")[0].style.display = "none";
                $(".cart-input").keyup(updateCartQuantity);
                $checkoutButton.click(downloadOrder);
                const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
                [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                })
                .catch(error=>{
                    $errorBody[0].innerText = error.message;
                    $errorToast.show();
                });
        }catch(error){
            $errorBody[0].innerText = error.message;
            $errorToast.show();
            localStorage.setItem('untrackedItems',JSON.stringify([]));
        } 
    }
    else{
        try{
            let cartEntry = JSON.parse(localStorage.getItem("cart"));
            let index = 0;
            for (let j = 0; j < cartEntry.length; j++) {
                if (cartEntry[j].email === email) {
                    index = j;
                    break;
                }
            }
            let cart = cartEntry[index].items;
            fetch("../assets/json/products.json")
            .then((response) => response.json())
            .then((json) => {
                const products = json.products;
                for (let i = 0; i < products.length; i++) {
                    for (let j = 0; j < cart.length; j++) {
                        if (products[i].id === cart[j].id) {
                            if(typeof(cart[j].quantity)==='number' && cart[j].quantity>0)
                            {
                                results.push({ "product": products[i], "quantity": cart[j].quantity });
                            }
                        }
                    }
                }
                if (!results.length) {
                    $("#cart-div")[0].style.display = "none";
                    $("#bill-details")[0].style.display = "none";
                    $checkoutButton[0].style.display = "none";
                    return;
                }
                let price = 0;
                let productHtml = generateCartHtml(results);
                let totalItemCount = 0;
                for(let i=0;i<results.length;i++){
                    price += results[i].product.price * results[i].quantity;
                    totalItemCount += results[i].quantity;
                }
                $emptyCartBox[0].style.display = "none";
                $totalBill[0].innerText = price;
                $totalCost[0].innerText = parseInt(price + 100);
                $("#cart-quantity")[0].innerHTML = totalItemCount > 1 ? `(${totalItemCount} items)` : `(${totalItemCount} item)`;
                $("#cart-items")[0].innerHTML = productHtml;
                $(".cart-input").keyup(updateCartQuantity);
                $checkoutButton.click(downloadOrder);
                const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
                [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                })
                .catch(error=>{
                    $errorBody[0].innerText = error.message;
                    $errorToast.show();
            });
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        }   
    }
}

function updateCartQuantity(event){
    let id = event.target.id.split("-")[1];
    let quantity = parseInt(event.target.value);
    if(quantity<=0){
        $errorBody[0].innerText = "Quantity must be greater than zero";
        $errorToast.show();
        return;
    }
    let price = $(event.target).closest(".card").find(".product-price")[0].dataset.price;
    let newSubtotal = parseInt(price) * quantity;
    $(event.target).closest(".card").find(".item-subtotal")[0].innerText = (newSubtotal.toLocaleString('en-IN'));
    updateCart(id,quantity);
    manageCart();
}

function downloadOrder(event){
    const email = localStorage.getItem("email");
    if(!email){
        $("#cart-box")[0].style.display = "none";
        window.location.href = "/html/login.html";
        return;
    }
    else{
        try{
            let cart = JSON.parse(localStorage.getItem("cart"));
            let index = 0;
            for(let i = 0; i < cart.length; i++) {
                if(cart[i].email===email) {
                    index = i;
                    break;
                }
            }
            let order = [];
            fetch("../assets/json/products.json")
            .then(res=>res.json())
            .then(json=>{
                const products = json.products;
                for(let i=0;i<cart[index].items.length;i++){
                    let id = cart[index].items[i].id;
                    let fields = {};
                    for(let j=0;j<products.length;j++){
                        if(products[j].id===id){
                            fields["sku_id"] = products[j].sku_id;
                            fields["title"] = products[j].title;
                            fields["quantity"] = cart[index].items[i].quantity;
                        }
                    }    
                    order.push(fields);
                }
                let config = {
                    quoteChar : '',
                    escapeChar : '',
                    delimiter : '\t',
                }
                let data = Papa.unparse(order, config);
                let blob = new Blob([data], {type: 'text/tsv;charset=utf-8'});
                let fileUrl = null;
                if (navigator.msSaveBlob) {
                    fileUrl = navigator.msSaveBlob(blob, 'download.tsv');
                } else {
                    fileUrl = window.URL.createObjectURL(blob);
                }
                let ele = document.createElement('a');
                ele.href=fileUrl;
                ele.setAttribute('download', 'download.tsv');
                ele.click();
                ele.remove();
                cart[index].items = [];
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartItemCount();
                location.reload();
                })
            .catch(error=>{
                $errorToast.find(".error-body").innerText = error.message;
                $errorToast.show();
            });
        } catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        } 
    }
}

function handleRemoveModal(id,price,event){
    event.stopPropagation();
    $("#item-id").val(id);
    $("#item-price").val(price);
    let title = $(event.target).closest(".card").find(".product-title")[0].innerText;
    $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong> from cart?`;
    $removeItemModal.modal('toggle');
}

function closeModal(){$removeItemModal.modal('toggle');}

function removeFromCart(){
    let id = parseInt($("#item-id").val());
    let price = parseInt($("#item-price").val());
    const email = localStorage.getItem("email");
    if(!email){
        try{
            let cart = JSON.parse(localStorage.getItem("untrackedItems"));
            let index2 = 0;
            for(let i=0; i < cart.length; i++) {
                if(cart[i].id===id){
                    index2 = i;
                    break;
                }
            }
            let orgPrice = parseInt($totalBill[0].innerText);
            $totalBill[0].innerText = (orgPrice - cart[index2].quantity * parseInt(price));
            cart = cart.filter(item => item.id!== id);
            localStorage.setItem('untrackedItems', JSON.stringify(cart));
            updateCartItemCount(email);
            location.reload();
        }catch(error){
            localStorage.setItem('untrackedItems', JSON.stringify([]));
            $errorBody[0].innerText = error.message;
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
            let orgPrice = parseInt($totalBill[0].innerText);
            $totalBill[0].innerText = (orgPrice - cart[index2].quantity * parseInt(price));
            cartEntry[index1].items = cartEntry[index1].items.filter(item => item.id!== id);
            localStorage.setItem('cart', JSON.stringify(cartEntry));
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

function showProductDetails(id){window.location.href=`/html/productDetails.html?id=${id}`;}

function decreaseQuantityOnCart(id,price,event){
    event.stopPropagation();
    const email = localStorage.getItem("email");
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
            cart[index2].quantity-=1;
            if(cart[index2].quantity<=0){
                $("#item-id").val(id);
                $("#item-price").val(price);
                let title = $(event.target).closest(".card").find(".product-title")[0].innerText;
                $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong> from cart?`;
                $removeItemModal.modal('toggle');
                return;
            }
            let orgPrice = parseInt($totalBill[0].innerText);
            $totalBill.text(orgPrice - parseInt(price));
            $totalCost.text(orgPrice - parseInt(price) + 100);
            let newSubtotal = parseInt(price) * cart[index2].quantity;
            $(event.target).closest(".card").find(".item-subtotal")[0].innerText = (newSubtotal.toLocaleString('en-IN'));
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
            $(`#input-`+id)[0].value = cart[index2].quantity;
            updateCartItemCount(email);
        }catch(error){
            localStorage.setItem('untrackedItems', JSON.stringify([]));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        let index1 = 0;
        try{
            let cartEntry = JSON.parse(localStorage.getItem("cart"));
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
                $("#item-id").val(id);
                $("#item-price").val(price);
                let title = $(event.target).closest(".card").find(".product-title")[0].innerText;
                $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong> from cart?`;
                $removeItemModal.modal('toggle');
                return;
            }
            let orgPrice = parseInt($totalBill[0].innerText);
            $totalBill[0].innerText = (orgPrice - parseInt(price));
            $totalCost.text(orgPrice - parseInt(price) + 100);
            let newSubtotal = parseInt(price) * cart[index2].quantity;
            $(event.target).closest(".card").find(".item-subtotal")[0].innerText = (newSubtotal.toLocaleString('en-IN'));
            localStorage.setItem("cart", JSON.stringify(cartEntry));
            $(`#input-`+id)[0].value = cart[index2].quantity;
            updateCartItemCount(email);
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        }
    }
}

function increaseQuantityOnCart(id,price,event){
    event.stopPropagation();
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
            cart[index2].quantity+=1;
            let orgPrice = parseInt($totalBill[0].innerText);
            $totalBill.text(orgPrice + parseInt(price));
            $totalCost.text(orgPrice + parseInt(price) + 100);
            let newSubtotal = parseInt(price) * cart[index2].quantity;
            $(event.target).closest(".card").find(".item-subtotal")[0].innerText = (newSubtotal.toLocaleString('en-IN'));
            localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
            $(`#input-`+id)[0].value = cart[index2].quantity;
            updateCartItemCount(email);
        }catch(error){
            localStorage.setItem('untrackedItems', JSON.stringify([]));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        }
    }
    else{
        let index1 = 0;
        try{
            let cartEntry = JSON.parse(localStorage.getItem("cart"));
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
            let orgPrice = parseInt($totalBill[0].innerText);
            $totalBill.text(orgPrice + parseInt(price));
            $totalCost.text(orgPrice + parseInt(price) + 100);
            let newSubtotal = parseInt(price) * cart[index2].quantity;
            $(event.target).closest(".card").find(".item-subtotal")[0].innerText = (newSubtotal.toLocaleString('en-IN'));
            localStorage.setItem("cart", JSON.stringify(cartEntry));
            $(`#input-`+id)[0].value = cart[index2].quantity;
            updateCartItemCount(email);
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        }
    }
}

function handleClearCart(){$clearCartModal.modal('toggle');}

function clearCart(event){
    event.preventDefault();
    const email = localStorage.getItem("email");
    if(!email){
        localStorage.setItem("untrackedItems", JSON.stringify([]));
    }
    else{
        try{
            let cartEntry = JSON.parse(localStorage.getItem("cart"));
            let index = 0;
            for (let j = 0; j < cartEntry.length; j++) {
                if (cartEntry[j].email === email) {
                    index = j;
                    break;
                }
            }
            cartEntry[index].items = [];
            localStorage.setItem("cart", JSON.stringify(cartEntry));
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        }
    }
    updateCartItemCount(email);
    location.reload();
}