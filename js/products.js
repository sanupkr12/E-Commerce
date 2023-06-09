const $searchForm = $("#search-form"),
$removeItemModal = $("#remove-item-modal"),
$successToast = $("#success-toast"),
$successBody = $successToast.find(".toast-body"),
$errorToast = $("#error-toast"),
$errorBody = $errorToast.find(".toast-body"),
$brandForm = $("#brand-list-form"),
$brandFormLg = $("#brand-list-form-lg"),
$ratingForm = $("#rating-list-form"),
$ratingFormLg = $("#rating-list-form-lg"),
$brandFilters = $("#brand-filters"),
$ratingFilters = $("#rating-filters"),
$filterModal = $("#filterModal"),
$productList = $("#product-list"),
$brandFilterBox = $("#brand-filter-box"),
$ratingFilterBox = $("#rating-filter-box");

$(document).ready(init);

function init(){
    $searchForm.submit(handleSearch);
    $removeItemModal.find("#remove-item").click(removeItemFromCart);
    $removeItemModal.find("#close-modal").click(closeModal);
    $errorToast.click(()=>{$errorToast.hide()});
    $("#reset-filter").click(resetFilter);
    $("#apply-filter").click(handleFilter);
    $("#reset-filter-lg").click(resetFilter);
    $("#apply-filter-lg").click(handleFilterlarge);
    $("#sort-by").change(handleSortBy);
    fetchProducts();
}

function fetchProducts() {
    fetch("../assets/json/products.json")
    .then(response => response.json())
    .then((json) => {
        const products = json.products;
        totalItem = products.length;
        try{
            const searchState = sessionStorage.getItem("searchState");
            if(searchState==1){
                restoreFilterToNormal();
            }
            sessionStorage.setItem("searchState",0);
        }catch(error){
            sessionStorage.setItem("searchState",0);
        }
        populateProducts(products);
    })
    .catch((error) => {
        $errorBody[0].innerText = "Unable to fetch products :" + error.message;
        $errorToast.show();
    });
}

function populateProducts(products) {
    if(searchProducts.length > 0)
    {
        products = [...searchProducts];
    }
    if((limit * (page - 1))>products.length)
    {
        return;
    }
    let brandList = [];
    if(searchProducts.length >0){
        for(let i=0;i<searchProducts.length;i++){
            brandList.push(searchProducts[i].brand);
        }
        let filter = JSON.parse(sessionStorage.getItem('filter'));
        brandList = [...new Set(brandList)];
        $brandForm[0].innerHTML = "";
        $brandFormLg[0].innerHTML = "";
        appendBrandFilters(filter["brand"],brandList); 
    }
    else{
        fetch("../assets/json/products.json")
        .then(res=>res.json())
        .then(data=>{
            for(let i=0;i<data.products.length;i++){
                brandList.push(data.products[i].brand);
            }
            brandList = [...new Set(brandList)];
            let filter = JSON.parse(sessionStorage.getItem('filter'));
            $brandForm[0].innerHTML = "";
            $brandFormLg[0].innerHTML = "";
            appendBrandFilters(filter["brand"],brandList); 
        }).catch(error=>{
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        })
    }
    let productHtml = "";
    products = applyFilter(products);
    products = applySort(products);
    appendFilters();
    for (let i = (limit * (page - 1)); i < ((limit * (page - 1) + limit) > products.length ? products.length :(limit * (page - 1) + limit)); i++) {
        const product = products[i];
        const email = localStorage.getItem("email");
        if(!email){
            try{
                let untrackedItems = JSON.parse(localStorage.getItem("untrackedItems"));
                let flag = false;
                for(let i = 0; i < (untrackedItems!=null?untrackedItems.length:0);i++){
                    if(untrackedItems[i].id === product.id){ 
                        productHtml += generateProductHtml(product,untrackedItems[i].quantity);
                        flag = true;
                        break;
                    }
                }
                if(flag==false){
                    productHtml += generateProductHtml(product,0);
                }
            }catch(error){
                $errorBody[0].innerText = error.message;
                $errorToast.show();
                localStorage.setItem("untrackedItems",JSON.stringify([]));
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
                let flag = false;
                let cart = cartEntry[index1].items;
                for(let i=0; i < cart.length; i++) {
                    if(cart[i].id===product.id){
                        index2 = i;
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    productHtml += generateProductHtml(product,cartEntry[index1].items[index2].quantity);
                }
                else{
                    productHtml += generateProductHtml(product,0);
                } 
            }catch(error){
                let cart = [];
                cart.push({"email":email,"items":[]});
                localStorage.setItem('cart',JSON.stringify(cart));
                $errorBody[0].innerText = error.message;
                $errorToast.show();
            }   
        }  
    }
    let itemCount = products.length / limit;
    if(itemCount>1){
        productHtml += `<nav aria-label="Page navigation example" class="d-flex justify-content-center">
                    <ul class="pagination">`;
        if(page==1){
            productHtml+=`<li class="page-item"><a class="page-link disabled" href="#">Previous</a></li>`;
        }
        else{
            productHtml+=`<li class="page-item"><a class="page-link" href="#">Previous</a></li>`;
        }
        productHtml += `<li class="page-item"><a class="page-link" href="#">Next</a></li>`;
        for (let i = 0; i < itemCount; i++) {
            if(i===0){
                productHtml += `<li class="page-item"><a class="page-link" id="page-${+i+1}" href="#">${+i + 1}</a></li>`
            }
            else{
                productHtml += `<li class="page-item"><a class="page-link" id="page-${+i+1}" href="#">${+i + 1}</a></li>`
            }
        }
        productHtml+=`</ul></nav>`;
    }
    $productList[0].innerHTML = productHtml;
    $(".w-input-product-card").keyup(updateProductQuantity);
    $(".page-link").click(handlePageClick);
    $('[data-bs-toggle="tooltip"]').tooltip({
        trigger : 'hover'
    });
}

function updateProductQuantity(event){
    let id = event.target.id.split("-")[1];
    let quantity = parseInt(event.target.value);
    if(quantity<=0){
        $errorBody[0].innerText = "quantity must be greater than zero";
        $errorToast.show();
        return;
    }
    updateCart(id,quantity);
    $successBody[0].innerText = "Quantity updated successfully";
    $successToast.show();
    setTimeout(()=>{$successToast.hide();},3000);
}

function appendFilters(){
    try{
        let filter = JSON.parse(sessionStorage.getItem("filter"));
        let brandFilters = filter["brand"];
        let ratingFilters = filter["rating"];
        $brandFilters[0].innerHTML = "";
        $ratingFilters[0].innerHTML = "";
        fetch("../assets/json/products.json")
        .then(res=>res.json())
        .then(json=>{
            const products = json.products;
            let validFilters = [];
            if(brandFilters.length >0){
                let brandHtml = "";
                for(let i = 0; i < brandFilters.length; i++){
                    let flag = false;
                    for(let j=0;j<products.length;j++){
                        if(products[j].brand.toLowerCase() === brandFilters[i])
                        {
                            flag = true;
                            break;
                        }
                    }
                    if(flag){
                        validFilters.push(brandFilters[i]);
                        let brand = brandFilters[i].length > 10 ? (brandFilters[i].substring(0,10) + "...") : brandFilters[i];
                        brandHtml += `<p class="mx-1 my-auto bg-secondary badge rounded-pill fw-bold" data-bs-toggle="tooltip" data-bs-title="Remove ${brandFilters[i]}" data-bs-placement="top">${brand} <i class="fa fa-light fa-xmark brand-badges hover-pointer" data-bs-toggle="tooltip" data-bs-title="${brandFilters[i]}"></i></p>`;
                    }
                }
                if(validFilters.length > 0){
                    $brandFilters[0].innerHTML = brandHtml;
                    $brandFilterBox[0].style.display = "block";
                }
                else{
                    $brandFilterBox[0].style.display = "none";
                }

                filter["brand"] = [...validFilters];
                sessionStorage.setItem("filter",JSON.stringify(filter));
            }
            else{
                $brandFilterBox[0].style.display = "none";
            }
            if(ratingFilters.length > 0){
                let ratingHtml = "";
                for(let i = 0; i < ratingFilters.length; i++){
                    ratingHtml += `<p class="mx-1 bg-secondary my-auto badge rounded-pill fw-bold" data-bs-toggle="tooltip" data-bs-title="Remove ${ratingFilters[i]}" data-bs-placement="top">${ratingFilters[i]} <i class=" text-warning fa-solid fa-star"></i> <i class="fa fa-light fa-xmark rating-badges hover-pointer" data-bs-title="Remove ${ratingFilters[i]}"></i></p>`;
                }
                $ratingFilters[0].innerHTML = ratingHtml;
                $ratingFilterBox[0].style.display = "block";
                $(".brand-badges").click(removeBrandFilter);
                $(".rating-badges").click(removeRatingFilter);  
            }
            else{
                $ratingFilterBox[0].style.display = "none";  
            }
        })
        .catch(error=>{
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        });
    }catch(error){
        restoreFilterToNormal();
        $errorBody[0].innerText = error.message;
        $errorToast.show();
    }
}

function appendBrandFilters(brandFilters,brandList) {
    if(brandFilters.length > 0){
        for(let i=0;i<brandList.length;i++)
        {
            let flag=false;
            let brand = brandList[i].toLowerCase();
            for(let j=0;j<brandFilters.length;j++){
                if(brandFilters[j].toLowerCase()===brand)
                {
                    flag = true;
                    $brandForm.append(addBrand(brand,true));
                    $brandFormLg.append(addBrand(brand,true));
                    break;
                }
            }
            if(flag===false){
                $brandForm.append(addBrand(brand,false));
                $brandFormLg.append(addBrand(brand,false));
            }
        }
    }
    else{
        for(let i=0;i<brandList.length;i++)
        {
            let brand = brandList[i].toLowerCase();
            $brandForm.append(addBrand(brand,false));
            $brandFormLg.append(addBrand(brand,false));
        }
    } 
}

function removeBrandFilter(event){
    event.preventDefault();
    let brand = $(event.target)[0].dataset.bsTitle;
    try{
        let filter = JSON.parse(sessionStorage.getItem('filter'));
        filter["brand"] = filter["brand"].filter((item)=>item.toLowerCase()!=brand.toLowerCase());
        sessionStorage.setItem("filter",JSON.stringify(filter));
        appendFilters();
        fetchProducts();
        $(this).tooltip('hide');
    }catch(error){
        restoreFilterToNormal();
        $errorBody[0].innerText = error.message;
        $errorToast.show();
    }
}

function removeRatingFilter(event){
    event.preventDefault();
    event.stopPropagation();
    let rating = $(event.target)[0].dataset.bsTitle.split(' ')[1].substring(0,2);
    try{
        let filter = JSON.parse(sessionStorage.getItem('filter'));
        filter["rating"] = filter["rating"].filter((item)=>item.toLowerCase()!=rating.toLowerCase());
        sessionStorage.setItem("filter",JSON.stringify(filter));
        appendFilters();
        fetchProducts();
        $(this).tooltip('hide');
    }
    catch(error){
        $errorBody[0].innerText = error.message;
        $errorToast.show();
    }
}

function handleSortBy(event){
    let sortBasis = event.target.value;
    try{
        let filter = JSON.parse(sessionStorage.getItem('filter'));
        switch(sortBasis){
            case 'phtl':{  
                filter["sort"]["phtl"] = 1;
                filter["sort"]["rhtl"] = 0;
                break;
            }
            case 'plth':{
                filter["sort"]["phtl"] = -1;
                filter["sort"]["rhtl"] = 0;
                break;
            }
            case 'rhtl':{
                filter["sort"]["phtl"] = 0;
                filter["sort"]["rhtl"] = 1;
                break;
            }
            default:{
                filter["sort"]["phtl"] = 0;
                filter["sort"]["rhtl"] = 0;
            }
        }
        sessionStorage.setItem("filter", JSON.stringify(filter));
        if(searchProducts.length > 0){
            searchProducts = applyFilter(searchProducts);
            searchProducts = applySort(searchProducts);
            populateProducts(searchProducts);
        }
        else{
            fetch("../assets/json/products.json")
            .then((response) => response.json())
            .then((json) => {
                let products = json.products;
                totalItem = products.length;
                products = applyFilter(products);
                products = applySort(products);
                populateProducts(products);
            }).catch(error=>{
                $errorBody[0].innerText = error.message;
                $errorToast.show();
            });
        }
    }catch(error){
        restoreFilterToNormal();
        $errorToast.find("toast-body")[0].innerText = error.message;
        $errorToast.show();
    }
}

function handleFilter(event){
    event.preventDefault();
    let brandList = JSON.parse(toJson($brandForm));
    let ratingList = JSON.parse(toJson($ratingForm));
    let $priceForm = $("#price-form");
    let priceData = JSON.parse(toJson($priceForm));
    let brandFilters = Object.keys(brandList);
    let ratingFilters = Object.keys(ratingList);
    addFilter(brandFilters, ratingFilters,priceData);
    $filterModal.modal('toggle');
}

function resetFilter(event){
    event.preventDefault();
    let filter = {"brand":[], "rating":[],"price":{"min":0,"max":1000000},"sort":{"phtl":0,"rhtl":0}};
    sessionStorage.setItem("filter",JSON.stringify(filter));
    location.reload();
}

function handleFilterlarge(event){
    event.preventDefault();
    let brandList = JSON.parse(toJson($brandFormLg));
    let ratingList = JSON.parse(toJson($ratingFormLg));
    let $priceForm = $("#price-form-lg");
    let priceData = JSON.parse(toJson($priceForm));
    if(priceData["min"]>priceData["max"]){
        $errorBody[0].innerText = "Minimum price cannot be greater than Maximum price";
        $errorToast.show();
        return;
    }
    let brandFilters = Object.keys(brandList);
    let ratingFilters = Object.keys(ratingList);
    addFilter(brandFilters,ratingFilters,priceData);
    $("#offcanvasExample").offcanvas("toggle");
}

function addFilter(brandFilters,ratingFilters,priceData){
    try{
        let filter = JSON.parse(sessionStorage.getItem("filter"));
        if(!filter){
            filter = {};
        }
        filter["brand"] = [...brandFilters];
        filter["rating"] = [...ratingFilters];
        let minPrice = 0;
        let maxPrice = 100000;
        if(priceData["min"]!="")
        {
            minPrice = parseInt(priceData["min"]);
        }
        if(priceData["max"]!="")
        {
            maxPrice = parseInt(priceData["max"]);
        }
        filter["price"] = {"min":minPrice,"max":maxPrice};
        sessionStorage.setItem("filter",JSON.stringify(filter));
        if(searchProducts.length > 0){
            populateProducts(searchProducts);
        }
        else{
            appendFilters();
            fetchProducts();
        }
    }catch(error){
        restoreFilterToNormal();
        $errorToast.find("toast-body")[0].innerText = error.message;
        $errorToast.show();
    }
}

function applyFilter(products){
    try{
        let filterObj = sessionStorage.getItem("filter");
        if(filterObj===null){
            restoreFilterToNormal();
            return products;
        }
        else{
            let filter = JSON.parse(sessionStorage.getItem("filter"));
            let brandFilters  = filter["brand"];
            let priceRangeFilters = filter["price"];
            let ratingFilters = filter["rating"];
            let res = [];
            if(brandFilters.length>0){
                for(let i=0;i<products.length;i++){
                    for(let j=0;j<brandFilters.length;j++){
                        if(products[i].brand.toLowerCase()==brandFilters[j].toLowerCase()){
                            res.push(products[i]);
                            break;
                        }
                    }
                }
                products = [...res];
            }
            res = [];
            if(priceRangeFilters!=null){
                    for(let i=0;i<products.length;i++){
                        if(products[i].price >= priceRangeFilters["min"] && products[i].price<priceRangeFilters["max"]){
                            res.push(products[i]);
                        }
                    }
                    $("#min-price").val(priceRangeFilters["min"]);
                    $("#max-price").val(priceRangeFilters["max"]);
                    $("#min-price-lg").val(priceRangeFilters["min"]);
                    $("#max-price-lg").val(priceRangeFilters["max"]);
                    products = [...res];
            } 
            res = [];
            if(ratingFilters.length>0){
                for(let i=0;i<products.length;i++){
                    for(let j=0;j<ratingFilters.length;j++){
                        let ratingRange = getRatingRange(ratingFilters[j]);
                        if(products[i].rating >= ratingRange["min"] && products[i].rating<ratingRange["max"]){
                            res.push(products[i]);
                            break;
                        }
                    }
                }
                for(let i=0;i<ratingFilters.length;i++){
                    ratingFilters[i] = ratingFilters[i].substring(0, ratingFilters[i].length-1);
                    $(`#rating-${ratingFilters[i]}`).prop("checked",true);
                    $(`#rating-${ratingFilters[i]}-lg`).prop("checked",true);
                }
                products = [...res];
            }
            else{
                $ratingForm.find("input[type=checkbox").prop("checked",false);
                $ratingFormLg.find("input[type=checkbox").prop("checked",false);
            }
            return products;
        }
    }catch(error){
        restoreFilterToNormal();
        $errorToast.find("toast-body")[0].innerText = error.message;
        $errorToast.show();
    }
    
}

function applySort(products){
    try{
        const filter = JSON.parse(sessionStorage.getItem("filter"));
        let phtl = filter["sort"]["phtl"];
        let rhtl = filter["sort"]["rhtl"];
        let flag = false;
        if(phtl!=null){
            if(phtl == 1){
                products.sort(comparePricehtl);
                $("#sort-by").val("phtl");
                flag = true;
            }
            else if(phtl == -1){
                products.sort(comparePricelth);
                $("#sort-by").val("plth");
                flag = true;
            }
            else if(phtl!=0){
                restoreFilterToNormal();
            }
        }
        if(rhtl!=null){
            if(rhtl == 1){
                products.sort(compareRatinghtl);
                $("#sort-by").val("rhtl");
                flag = true;
            }
            else if(rhtl!=0){
                restoreFilterToNormal();
            }
        }
        if(!flag){
            $("#sort-by").val("relevance");
        }
        return products;
    }catch(error){
        restoreFilterToNormal();
        $errorBody[0].innerText = error.message;
        $errorToast.show();
    }
}

function getRatingRange(ratingFilter){
    switch(ratingFilter){
        case "1+":{return {min:1,max:5};}
        case "2+":{return {min:2,max:5};}
        case "3+":{return {min:3,max:5};}
        case "4+":{return {min:4,max:5};}
        default:{return {min:0,max:5};}
    }
}

function comparePricelth( a, b) {
    if ( a.price < b.price ){
      return -1;
    }
    if ( a.price > b.price ){
      return 1;
    }
    return 0;
}

function comparePricehtl( a, b) {
    if ( a.price > b.price ){
      return -1;
    }
    if ( a.price < b.price ){
      return 1;
    }
    return 0;
}

function compareRatinghtl( a, b) {
    if ( a.rating > b.rating ){
      return -1;
    }
    if ( a.rating < b.rating ){
      return 1;
    }
    return 0;
}

function handleSearch(event) {
    event.preventDefault();
    page = 1;
    let query = $("#search-input")[0].value.toLowerCase();
    fetch("../assets/json/products.json")
    .then((response) => response.json())
    .then((json) => {
        let products = json.products;
        let results = [];
        for (let i = 0; i < products.length; i++) {
            if (products[i].description.toLowerCase().includes(query) || products[i].title.toLowerCase().includes(query) || products[i].brand.toLowerCase().includes(query) || products[i].price.toString().includes(query)) {
                results.push(products[i]);
            }
        }
        restoreFilterToNormal();
        appendFilters();
        if (results.length === 0) {
            $productList[0].innerHTML = `<img src="../assets/images/noProducts.png" class="img-fluid w-auto mx-auto" id="no-product-img"/>`;  
            return;
        }
        else {
            searchProducts = [...results];
            sessionStorage.setItem('searchState',1);
            populateProducts(searchProducts);
        }
    })
    .catch((error) => {
        $errorBody.innerText = error.message;
        $errorToast.show();
    });
}

function goToProduct(id){window.location.href = `/html/productDetails.html?id=${id}`;}

function handlePageClick(event) {
    const val = event.target.innerText;
    console.log(val);
    if (val == "Previous") {
        if (page >= 2) {
            page -= 1;
        }
    }
    else if (val == "Next") {
        if (page < (totalItem / limit)) {
            page += 1;
        }
    }
    else {
        page = parseInt(val);
    }
    console.log($(`#page-${page}`));
    $(`#page-${page}`)[0].classList.add('active');
    fetchProducts();
}

function addProduct(id,event){
    event.stopPropagation();
    if(event.target.innerText === "GO TO CART"){
        window.location.href="/html/cart.html";
        return;
    }
    appendToCart(id);
    event.target.innerText = "GO TO CART";
}

function addProductInCart(id,event){
    event.stopPropagation();
    appendToCart(id);
    updateCartItemCount();
    fetchProducts();
}

function appendToCart(id){
    const email = localStorage.getItem('email');
    if(!email){
        try{
            let items = JSON.parse(localStorage.getItem('untrackedItems'));
            let flag = false;
            let index2 = 0;
            for(let i=0; i < items.length; i++) {
                if(items[i].id===id){
                    flag = true;
                    index2 = i;
                    break;
                }
            }
            if(flag)
            {
                items[index2].quantity+=1;
            }
            else{
                items.push({id:id,quantity:1});
            }
            localStorage.setItem('untrackedItems', JSON.stringify(items));
            updateCartItemCount(email);
            $successBody[0].innerText = "Product added to cart";
            $successToast.toast("show");
        }catch(error){
            $errorBody[0].innerText = error.message;
            $errorToast.show();
            localStorage.setItem('untrackedItems', JSON.stringify([]));
        }
    }
    else{
        try{
            let cart = JSON.parse(localStorage.getItem('cart'));
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
            for(let i=0; i < items.length; i++) {
                if(items[i].id===id){
                    flag = true;
                    index2 = i;
                    break;
                }
            }
            if(flag)
            {
                items[index2].quantity+=1;
            }
            else{
                cart[index1].items.push({id:id,quantity:1});
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartItemCount(email);
            $successBody[0].innerText = "Product added to cart";
            $successToast.toast("show");
            
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorBody[0].innerText = error.message;
            $errorToast.show();
        }
    }
}

function closeModal(){$removeItemModal.modal('toggle')}

function restoreFilterToNormal(){
    let filter = {};
    filter["brand"] = [];
    filter["rating"] = [];
    filter["price"] = {"min":0,"max":100000};
    filter["sort"] = {"phtl":0,"rhtl":0};
    sessionStorage.setItem("filter",JSON.stringify(filter));
}