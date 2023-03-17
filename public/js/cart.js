$(document).ready(init);

function init(){
    $("#remove-item").click(removeFromCart); 
    $("#close-modal").click(closeModal);
    $("#clear-cart").click(handleClearCart);
    $("#close-clear-modal").click(()=>$("#clear-cart-modal").modal('toggle'));
    $("#remove-cart").click(clearCart);
    $("#redirect-box")[0].style.display = "none";
    manageCart();
}

function manageCart(){
    let results = [];
    let email = localStorage.getItem("email");
    if(!email){
        let cart = JSON.parse(localStorage.getItem("untrackedItems"));
    
    fetch("../data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
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
                $("#empty-cart-image")[0].src = "./images/empty-cart.png";
                $("#bill-details")[0].style.display = "none";
                $("#checkout-btn")[0].style.display = "none";
                return;
            }
            let price = 0;
            let productHtml = generateCartHtml(results);
            for(let i=0;i<results.length;i++){
                price += results[i].product.price * results[i].quantity;
            }
            $("#empty-cart-box")[0].style.display = "none";
            $("#total-bill")[0].innerText = price;
            $("#total-cost")[0].innerText = parseInt(price + 100);
            $("#cart-quantity")[0].innerHTML = results.length > 1 ? `(${results.length} items)` : `(${results.length} item)`;
            $("#cart-items")[0].innerHTML = productHtml;
            $('#checkout-btn').click(downloadOrder);
            const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            });
    }
    else{
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
    let index = 0;
    for (let j = 0; j < cartEntry.length; j++) {
        if (cartEntry[j].email === email) {
            index = j;
            break;
        }
    }
    let cart = cartEntry[index].items;
    fetch("../data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
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
                $("#empty-cart-image")[0].src = "../images/empty-cart.png";
                $("#bill-details")[0].style.display = "none";
                $("#checkout-btn")[0].style.display = "none";
                return;
            }
            let price = 0;
            let productHtml = generateCartHtml(results);
            for(let i=0;i<results.length;i++){
                price += results[i].product.price * results[i].quantity;
            }
            $("#empty-cart-box")[0].style.display = "none";
            $("#total-bill")[0].innerText = price;
            $("#total-cost")[0].innerText = parseInt(price + 100);
            $("#cart-quantity")[0].innerHTML = results.length > 1 ? `(${results.length} items)` : `(${results.length} item)`;
            $("#cart-items")[0].innerHTML = productHtml;
            $('#checkout-btn').click(downloadOrder);
            const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
            [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
            });
    }
}

function downloadOrder(event){
    let email = localStorage.getItem("email");
    if(!email){
        $("#redirect-box")[0].style.display = "block";
        $("#cart-box")[0].style.display = "none";
        setTimeout(()=>{window.location.href = "/public/html/login.html";},2500); 
        return;
    }
    else{
    let cart = JSON.parse(localStorage.getItem("cart"));
    let index = 0;
    for(let i = 0; i < cart.length; i++) {
        if(cart[i].email===email) {
            index = i;
            break;
        }
    }
    let order = [];
    fetch("../data/products.json")
    .then(res=>res.json())
    .then(json=>{
        let products = json.products;
        for(let i=0;i<cart[index].items.length;i++){
            let id = cart[index].items[i].id;
            let fields = {};
            for(let j=0;j<products.length;j++){
                if(products[j].id===id){
                    fields["sku_id"] = products[j].sku_id;
                    fields["title"] = products[j].title;
                    console.log(cart[index].items[i].quantity);
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
        } 
    );
    }
}

function handleRemoveModal(id,price,event){
    event.stopPropagation();
    $("#item-id").val(id);
    $("#item-price").val(price);
    let title = $(event.target).closest(".card").find(".product-title")[0].innerText;
    $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong> from cart?`;
    $("#remove-item-modal").modal('toggle');
}

function closeModal(){
    $("#remove-item-modal").modal('toggle');
}

function removeFromCart(){
    let id = parseInt($("#item-id").val());
    let price = parseInt($("#item-price").val());
    let email = localStorage.getItem("email");
    if(!email){
        let cart = JSON.parse(localStorage.getItem("untrackedItems"));
        let index2 = 0;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                break;
            }
        }
        let orgPrice = parseInt($("#total-bill")[0].innerText);
        $("#total-bill")[0].innerText = (orgPrice - cart[index2].quantity * parseInt(price));
        cart = cart.filter(item => item.id!== id);
        localStorage.setItem('untrackedItems', JSON.stringify(cart));
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
        let index2 = 0;
        let cart = cartEntry[index1].items;
        for(let i=0; i < cart.length; i++) {
            if(cart[i].id===id){
                index2 = i;
                break;
            }
        }
        let orgPrice = parseInt($("#total-bill")[0].innerText);
        $("#total-bill")[0].innerText = (orgPrice - cart[index2].quantity * parseInt(price));
        cartEntry[index1].items = cartEntry[index1].items.filter(item => item.id!== id);
        localStorage.setItem('cart', JSON.stringify(cartEntry));
        updateCartItemCount(email);
        location.reload();
    }
}

function showProductDetails(id){
    window.location.href=`/public/html/productDetails.html?id=${id}`;
}

function decreaseQuantityOnCart(id,price,event){
    event.stopPropagation();
    let email = localStorage.getItem("email");
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
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
            $("#item-id").val(id);
            $("#item-price").val(price);
            let title = $(event.target).closest(".card").find(".product-title")[0].innerText;
            $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong> from cart?`;
            $("#remove-item-modal").modal('toggle');
            return;
        }
        let orgPrice = parseInt($("#total-bill")[0].innerText);
        $("#total-bill").text(orgPrice - parseInt(price));
        $("#total-cost").text(orgPrice - parseInt(price) + 100);
        localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        $(`#input-`+id)[0].value = cart[index2].quantity;
    }
    else{
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
            $("#item-id").val(id);
            $("#item-price").val(price);
            let title = $(event.target).closest(".card").find(".product-title")[0].innerText;
            $("#item-title")[0].innerHTML = `Are you sure you want to remove <strong>${title}</strong> from cart?`;
            $("#remove-item-modal").modal('toggle');
            return;
        }
        let orgPrice = parseInt($("#total-bill")[0].innerText);
        $("#total-bill")[0].innerText = (orgPrice - parseInt(price));
        $("#total-cost").text(orgPrice - parseInt(price) + 100);
        localStorage.setItem("cart", JSON.stringify(cartEntry));
        $(`#input-`+id)[0].value = cart[index2].quantity;
    }
}

function increaseQuantityOnCart(id,price,event){
    event.stopPropagation();
    let email = localStorage.getItem("email");
    let cartEntry = JSON.parse(localStorage.getItem("cart"));
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
        let orgPrice = parseInt($("#total-bill")[0].innerText);
        $("#total-bill").text(orgPrice + parseInt(price));
        $("#total-cost").text(orgPrice + parseInt(price) + 100);
        localStorage.setItem("untrackedItems", JSON.stringify(untrackedItems));
        $(`#input-`+id)[0].value = cart[index2].quantity;
    }
    else{
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
        $("#total-bill").text(orgPrice + parseInt(price));
        $("#total-cost").text(orgPrice + parseInt(price) + 100);
        localStorage.setItem("cart", JSON.stringify(cartEntry));
        $(`#input-`+id)[0].value = cart[index2].quantity;
    }
}

function handleClearCart(event){
    event.preventDefault();
    $("#clear-cart-modal").modal('toggle');
}

function clearCart(event){
    event.preventDefault();
    let email = localStorage.getItem("email");
    if(!email){
        localStorage.setItem("untrackedItems", JSON.stringify([]));
    }
    else{
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
    }
    updateCartItemCount(email);
    location.reload();
}