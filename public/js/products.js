$(document).ready(init);

function init(){
    $("#search-form").submit(handleSearch);
    $("#reset-filter").click(resetFilter);
    $("#apply-filter").click(handleFilter);
    $("#reset-filter-lg").click(resetFilter);
    $("#apply-filter-lg").click(handleFilterlarge);
    $("#sort-by").on('change',handleSortBy);
    fetchProducts();
}

function handleSortBy(event){
    let sortBasis = event.target.value;
    if(sortBasis == 'phtl'){
        sessionStorage.setItem("phtl",1);
        sessionStorage.setItem("rhtl",0);
    }
    else if(sortBasis == 'plth'){
        sessionStorage.setItem("phtl",-1);
        sessionStorage.setItem("rhtl",0);
    }
    else if(sortBasis == 'rhtl'){
        sessionStorage.setItem("phtl",0);
        sessionStorage.setItem("rhtl",1);
    }
    else{
        sessionStorage.setItem("phtl",0);
        sessionStorage.setItem("rhtl",0);
    }
    if(searchProducts.length > 0){
        searchProducts = applyFilter(searchProducts);
        searchProducts = applySort(searchProducts);
        populateProducts(searchProducts);
    }
    else{
        fetch("../data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
            totalItem = products.length;
            products = applyFilter(products);
            products = applySort(products);
            populateProducts(products);
        });
    }
}
function handleFilter(event){
    event.preventDefault();
    let $brandForm = $("#brand-list-form");
    let brandList = JSON.parse(toJson($brandForm));
    let $ratingForm = $("#rating-list-form");
    let ratingList = JSON.parse(toJson($ratingForm));
    let $priceForm = $("#price-form");
    let priceData = JSON.parse(toJson($priceForm));
    let brandFilters = Object.keys(brandList).join(",");
    if(brandFilters.length > 0){
        sessionStorage.setItem("brandFilters",brandFilters);
    }
    let ratingFilters = Object.keys(ratingList).join(",");
    if(ratingFilters.length > 0){
        sessionStorage.setItem("ratingFilters",ratingFilters);
    }
    let minPrice = 0;
    let maxPrice = 100000000;
    if(priceData["min"]!="")
    {
        minPrice = parseInt(priceData["min"]);
    }

    if(priceData["max"]!="")
    {
        maxPrice = parseInt(priceData["max"]);
    }
    sessionStorage.setItem("priceFilters",JSON.stringify({"min":minPrice,"max":maxPrice}));
    if(searchProducts.length > 0){
        populateProducts(searchProducts);
        $("#filterModal").modal('toggle');
    }
    else{
        location.reload();
    }
}

function resetFilter(event){
    event.preventDefault();
    sessionStorage.clear();
    location.reload();
}

function handleFilterlarge(event){
    event.preventDefault();
    let $brandForm = $("#brand-list-form-lg");
    let brandList = JSON.parse(toJson($brandForm));
    let $ratingForm = $("#rating-list-form-lg");
    let ratingList = JSON.parse(toJson($ratingForm));
    let $priceForm = $("#price-form-lg");
    let priceData = JSON.parse(toJson($priceForm));
    let brandFilters = Object.keys(brandList).join(",");
    if(brandFilters.length > 0){
        sessionStorage.setItem("brandFilters",brandFilters);
    }
    let ratingFilters = Object.keys(ratingList).join(",");
    if(ratingFilters.length > 0){
        sessionStorage.setItem("ratingFilters",ratingFilters);
    }
    let minPrice = 0;
    let maxPrice = 100000000;
    if(priceData["min"]!="")
    {
        minPrice = parseInt(priceData["min"]);
    }

    if(priceData["max"]!="")
    {
        maxPrice = parseInt(priceData["max"]);
    }
    sessionStorage.setItem("priceFilters",JSON.stringify({"min":minPrice,"max":maxPrice}));
    if(searchProducts.length > 0){
        populateProducts(searchProducts);
    }
    else{
        location.reload();
    }
}

function applyFilter(products){
    let brandFilters  = sessionStorage.getItem("brandFilters");
    let priceRangeFilters = JSON.parse(sessionStorage.getItem("priceFilters"));
    let ratingFilters = sessionStorage.getItem("ratingFilters");
    let res = [];
    if(brandFilters){
        brandFilters = brandFilters.split(",");
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
    }
    res = [];
    if(priceRangeFilters){
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
    if(ratingFilters){
        ratingFilters = ratingFilters.split(",");
        if(ratingFilters.length >0){
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
                $(`#rating-${ratingFilters[i]}`).prop("checked",true);
                $(`#rating-${ratingFilters[i]}-lg`).prop("checked",true);
            }
            products = [...res];
        }
    }
    return products;
}

function applySort(products){
    let phtl = sessionStorage.getItem("phtl");
    let rhtl = sessionStorage.getItem("rhtl");
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
    }
    if(rhtl!=null){
        if(rhtl == 1){
            products.sort(compareRatinghtl);
            $("#sort-by").val("rhtl");
            flag = true;
        }
    }
    if(!flag){
        $("#sort-by").val("relevance");
    }
    return products;
}

function getRatingRange(ratingFilter){
    if(ratingFilter === "0-1"){
        return {min:0,max:1};
    }
    else if(ratingFilter === "1-2"){
        return {min:1,max:2};
    }
    else if(ratingFilter === "2-3"){
        return {min:2,max:3};
    }
    else if(ratingFilter === "3-4"){
        return {min:3,max:4};
    }
    else {
        return {min:4,max:5};
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
    fetch("../data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
            let results = [];
            for (let i = 0; i < products.length; i++) {
                if (products[i].description.toLowerCase().includes(query) || products[i].title.toLowerCase().includes(query) || products[i].brand.toLowerCase().includes(query) || products[i].price.toString().includes(query)) {
                    results.push(products[i]);
                }
            }
            if (results.length === 0) {
                alert("No products to show");
            }
            else {
                searchProducts = [...results];
                sessionStorage.clear();
                populateProducts(searchProducts);
            }
        });
}

function fetchProducts() {
    fetch("../data/products.json")
    .then((response) => response.json())
    .then((json) => {
        let products = json.products;
        totalItem = products.length;
        populateProducts(products);
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
            brandList.push(products[i].brand);
        }
        let brandFilters = sessionStorage.getItem('brandFilters');
        brandList = [...new Set(brandList)];
        $("#brand-list-form")[0].innerHTML = "";
        if(brandFilters!=null){
            let brandFiltersArray = brandFilters.split(",");
            for(let i=0;i<brandList.length;i++)
            {
                let flag=false;
                let brand = brandList[i].toLowerCase()
                for(let j=0;j<brandFiltersArray.length;j++){
                    if(brandFiltersArray[j].toLowerCase()===brand)
                    {
                        flag = true;
                        $("#brand-list-form").append(`<div class="form-check">
                        <input class="form-check-input" checked type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                        <label class="form-check-label" for="brand-${brand}">
                        ${brandList[i]}
                        </label>
                        </div>`);
                        break;
                    }
                }
                if(flag===false){
                    $("#brand-list-form").append(`<div class="form-check">
                    <input class="form-check-input" type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                    <label class="form-check-label" for="brand-${brand}">
                    ${brandList[i]}
                    </label>
                    </div>`);
                }
            }
        }
        else{
            for(let i=0;i<brandList.length;i++)
            {
                $("#brand-list-form").append(`<div class="form-check">
                <input class="form-check-input" type="checkbox" name="${brandList[i]}" id="brand-${brandList[i].toLowerCase()}">
                <label class="form-check-label" for="brand-${brandList[i].toLowerCase()}">
                ${brandList[i]}
                </label>
                </div>`);
            }
        }  
    }
    else{
        fetch("../data/products.json")
        .then(res=>res.json())
        .then(data=>{
            for(let i=0;i<data.products.length;i++){
                brandList.push(data.products[i].brand);
            }
            brandList = [...new Set(brandList)];
            let brandFilters = sessionStorage.getItem('brandFilters');
            $("#brand-list-form")[0].innerHTML = "";
            $("#brand-list-form-lg")[0].innerHTML = "";
            if(brandFilters!=null){
                let brandFiltersArray = brandFilters.split(",");
                for(let i=0;i<brandList.length;i++)
                {
                    let flag=false;
                    let brand = brandList[i].toLowerCase();
                    for(let j=0;j<brandFiltersArray.length;j++){
                        if(brandFiltersArray[j].toLowerCase()===brand)
                        {
                            flag = true;
                            $("#brand-list-form").append(`<div class="form-check">
                            <input class="form-check-input" checked type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                            <label class="form-check-label" for="brand-${brand}">
                            ${brandList[i]}
                            </label>
                            </div>`);
                            $("#brand-list-form-lg").append(`<div class="form-check">
                            <input class="form-check-input" checked type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                            <label class="form-check-label" for="brand-${brand}">
                            ${brandList[i]}
                            </label>
                            </div>`);
                            break;
                        }
                    }
                    if(flag===false){
                        $("#brand-list-form").append(`<div class="form-check">
                        <input class="form-check-input" type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                        <label class="form-check-label" for="brand-${brand}">
                        ${brandList[i]}
                        </label>
                        </div>`);
                        $("#brand-list-form-lg").append(`<div class="form-check">
                        <input class="form-check-input" type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                        <label class="form-check-label" for="brand-${brand}">
                        ${brandList[i]}
                        </label>
                        </div>`);
                    }
                }
            }
            else{
                for(let i=0;i<brandList.length;i++)
                {
                    let brand = brandList[i].toLowerCase();
                    $("#brand-list-form").append(`<div class="form-check">
                    <input class="form-check-input" type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                    <label class="form-check-label" for="brand-${brand}">
                    ${brandList[i]}
                    </label>
                    </div>`);
                    $("#brand-list-form-lg").append(`<div class="form-check">
                    <input class="form-check-input" type="checkbox" name="${brandList[i]}" id="brand-${brand}">
                    <label class="form-check-label" for="brand-${brand}">
                    ${brandList[i]}
                    </label>
                    </div>`);
                }
            }  
        })
    }
    let productHtml = "";
    products = applyFilter(products);
    products = applySort(products);
    for (let i = (limit * (page - 1)); i < ((limit * (page - 1) + limit) > products.length ? products.length :(limit * (page - 1) + limit)); i++) {
        let product = products[i];
        let email = localStorage.getItem("email");
        if(!email){
            let untrackedItems = localStorage.getItem("untrackedItems");
            let flag = false;
            for(let i = 0; i < (untrackedItems!=null?untrackedItems.length:0);i++){
                if(untrackedItems[i].id === product.id){
                    productHtml += `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card rounded-1 shadow product-box mx-auto">
                        <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                        <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                        <span class="card-rating-box">${product.rating} ⭐</span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mt-1 card-title-text hover-pointer fw-normal text-muted" onclick="goToProduct(${product.id})">${product.title}</h5>
                            <h6>${"₹ " + product.price}</h6>
                            <p class="card-text card-description-text">${product.description}</p>
                            <div class="d-flex align-items-center">
                            <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                            <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center mx-1" id="${"input-" + product.id}" value=${untrackedItems[i].quantity} readonly="true">
                            <button class="btn btn-warning py-1"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
                            </div>
                        </div> 
                        </div>
                        </div>`;
                        flag = true;
                    break;
                }
            }
            if(flag==false){
                productHtml += `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card rounded-1 shadow product-box mx-auto">
                        <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                        <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                        <span class="card-rating-box">${product.rating} ⭐</span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mt-1 card-title-text hover-pointer fw-normal text-muted" onclick="goToProduct(${product.id})">${product.title}</h5>
                            <h6>${"₹ " + product.price}</h6>
                            <p class="card-text card-description-text">${product.description}</p>
                            <div class="d-flex align-items-center">
                            <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                            <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center mx-1" id="${"input-" + product.id}" value="0" readonly="true">
                            <button class="btn btn-warning py-1"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
                            </div>
                        </div> 
                        </div>
                        </div>`;
            }
        }
        else{
            let index1 = 0;
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
                productHtml += `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card rounded-1 shadow product-box mx-auto" >
                        <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                        <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                        <span class="card-rating-box">${product.rating} ⭐</span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mt-1 card-title-text hover-pointer fw-normal text-muted" onclick="goToProduct(${product.id})">${product.title}</h5>
                            <h6>${"₹ " + product.price}</h6>
                            <p class="card-text card-description-text">${product.description}</p>
                            <div class="d-flex align-items-center">
                            <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                            <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center mx-1" id="${"input-" + product.id}" value=${cartEntry[index1].items[index2].quantity} readonly="true">
                            <button class="btn btn-warning py-1"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
                            </div>
                        </div> 
                        </div>
                        </div>`;
            }
            else{
                productHtml += `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                    <div class="card rounded-1 shadow product-box mx-auto" >
                        <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                        <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                        <span class="card-rating-box">${product.rating} ⭐</span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mt-1 card-title-text hover-pointer fw-normal text-muted" onclick="goToProduct(${product.id})">${product.title}</h4>
                            <h6>${"₹ " + product.price}</h6>
                            <p class="card-text card-description-text">${product.description}</p>
                            <div class="d-flex align-items-center">
                            <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                            <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center mx-1" id="${"input-" + product.id}" value="0" readonly="true">
                            <button class="btn btn-warning py-1"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
                            </div>
                        </div> 
                        </div>
                        </div>`;
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
            for (let i = 0; i < itemCount; i++) {
                productHtml += `<li class="page-item"><a class="page-link" href="#">${+i + 1}</a></li>`
            }
            productHtml += `<li class="page-item"><a class="page-link" href="#">Next</a></li>
                    </ul>
                    </nav>`;
    }
    $("#product-list")[0].innerHTML = productHtml;
    $(".page-link").click(handlePageClick);
}

function goToProduct(id){
    window.location.href = `/public/html/productDetails.html?id=${id}`;
}
function handlePageClick(event) {
    let val = event.target.innerText;
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
    fetchProducts();
}

function addProduct(id,event){
    event.stopPropagation();
    if(event.target.innerText === "GO TO CART"){
        window.location.href="/public/html/cart.html";
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart'));
    let email = localStorage.getItem('email');
    if(!email){
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
        $(".toast-body")[0].innerText = "Product added to cart";
        $("#success-toast").toast("show");
        event.target.innerText = "GO TO CART";
    }
    else{
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
        $(".toast-body")[0].innerText = "Product added to cart";
        $("#success-toast").toast("show");
        event.target.innerText = "GO TO CART";
    }
}
