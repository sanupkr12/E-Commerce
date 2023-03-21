const $searchForm = $("#search-form"),
$removeItemModal = $("#remove-item-modal"),
$successToast = $("#success-toast"),
$errorToast = $("#error-toast"),
$brandForm = $("#brand-list-form"),
$brandFormLg = $("#brand-list-form-lg");

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
    fetch("../assets/data/products.json")
    .then((response) => response.json())
    .then((json) => {
        const products = json.products;
        totalItem = products.length;
        populateProducts(products);
    })
    .catch((error) => {
        $errorToast.find(".toast-body").innerText = error.message;
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
        fetch("../assets/data/products.json")
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
            $errorToast.find(".toast-body")[0].innerText = error.message;
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
                $errorToast.find(".toast-body")[0].innerText = error.message;
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
                $errorToast.find(".toast-body")[0].innerText = error.message;
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

function appendFilters(){
    let filter = JSON.parse(sessionStorage.getItem("filter"));
    let brandFilters = filter["brand"];
    let ratingFilters = filter["rating"];
    $("#brand-filters")[0].innerHTML = "";
    $("#rating-filters")[0].innerHTML = "";
    if(brandFilters.length >0){
        let brandHtml = "";
        for(let i = 0; i < brandFilters.length; i++){
            let brand = brandFilters[i].length > 10 ? (brandFilters[i].substring(0,10) + "...") : brandFilters[i];
            brandHtml += `<p class="mx-1 my-auto bg-secondary badge rounded-pill fw-bold brand-badges hover-pointer">${brand} ×</p>`;
        }
        $("#brand-filters")[0].innerHTML = brandHtml;
        $("#brand-filter-box")[0].style.display = "block";
    }
    else{
        $("#brand-filter-box")[0].style.display = "none";
    }
    if(ratingFilters.length > 0){
        let ratingHtml = "";
        for(let i = 0; i < ratingFilters.length; i++){
            ratingHtml += `<p class="mx-1 bg-secondary my-auto badge rounded-pill fw-bold rating-badges hover-pointer">${ratingFilters[i]} ⭐ ×</p>`;
        }
        $("#rating-filters")[0].innerHTML = ratingHtml;
        $("#rating-filter-box")[0].style.display = "block";
        $(".brand-badges").click(removeBrandFilter);
        $(".rating-badges").click(removeRatingFilter);  
    }
    else{
        $("#rating-filter-box")[0].style.display = "none";  
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
    event.stopPropagation();
    event.preventDefault();
    let brand = $(event.target)[0].innerText;
    brand = brand.substring(0,brand.length-2);
    let filter = JSON.parse(sessionStorage.getItem('filter'));
    let brandFilter = filter["brand"];
    let newBrandFilter = [];
    for(let i=0;i<brandFilter.length;i++){
        if(brandFilter[i]!=brand){
            newBrandFilter.push(brandFilter[i]);
        }
    }
    filter["brand"] = newBrandFilter;
    sessionStorage.setItem("filter",JSON.stringify(filter));
    location.reload();
}

function removeRatingFilter(event){
    event.stopPropagation();
    event.preventDefault();
    let rating = $(event.target)[0].innerText;
    rating = rating.substring(0,rating.length-4);
    let filter = JSON.parse(sessionStorage.getItem('filter'));
    let ratingFilter = filter["rating"];
    let newRatingFilter = [];
    for(let i=0;i<ratingFilter.length;i++){
        if(ratingFilter[i]!=rating){
            newRatingFilter.push(ratingFilter[i]);
        }
    }
    filter["rating"] = newRatingFilter;
    sessionStorage.setItem("filter",JSON.stringify(filter));
    location.reload();
}

function handleSortBy(event){
    let sortBasis = event.target.value;
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
        fetch("../assets/data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
            totalItem = products.length;
            products = applyFilter(products);
            products = applySort(products);
            populateProducts(products);
        }).catch(error=>{
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        });
    }
}

function handleFilter(event){
    event.preventDefault();
    let brandList = JSON.parse(toJson($brandForm));
    let $ratingForm = $("#rating-list-form");
    let ratingList = JSON.parse(toJson($ratingForm));
    let $priceForm = $("#price-form");
    let priceData = JSON.parse(toJson($priceForm));
    let brandFilters = Object.keys(brandList);
    let ratingFilters = Object.keys(ratingList);
    addFilter(brandFilters, ratingFilters,priceData);
    if(searchProducts.length > 0){
        $("#filterModal").modal('toggle');
    }
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
    let $ratingForm = $("#rating-list-form-lg");
    let ratingList = JSON.parse(toJson($ratingForm));
    let $priceForm = $("#price-form-lg");
    let priceData = JSON.parse(toJson($priceForm));
    let brandFilters = Object.keys(brandList);
    let ratingFilters = Object.keys(ratingList);
    addFilter(brandFilters,ratingFilters,priceData);
}

function addFilter(brandFilters,ratingFilters,priceData){
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
        location.reload();
    }
}

function applyFilter(products){
    let filterObj = sessionStorage.getItem("filter");
    if(filterObj===null){
        let filter = {};
        filter["brand"] = [];
        filter["rating"] = [];
        filter["price"] = {"min":0,"max":100000};
        filter["sort"] = {"phtl":0,"rhtl":0};
        sessionStorage.setItem("filter",JSON.stringify(filter));
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
                $(`#rating-${ratingFilters[i]}`).prop("checked",true);
                $(`#rating-${ratingFilters[i]}-lg`).prop("checked",true);
            }
            products = [...res];
        }
        else{
            $("#rating-list-form").find("input[type=checkbox").prop("checked",false);
            $("#rating-list-form-lg").find("input[type=checkbox").prop("checked",false);
        }
        return products;
    }
}

function applySort(products){
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
    switch(ratingFilter){
        case "0-1":{
            return {min:0,max:1};
        }
        case "1-2":{
            return {min:1,max:2};
        }
        case "2-3":{
            return {min:2,max:3};
        }
        case "3-4":{
            return {min:3,max:4};
        }
        default:{
            return {min:4,max:5};
        }
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
    fetch("../assets/data/products.json")
    .then((response) => response.json())
    .then((json) => {
        let products = json.products;
        let results = [];
        for (let i = 0; i < products.length; i++) {
            if (products[i].description.toLowerCase().includes(query) || products[i].title.toLowerCase().includes(query) || products[i].brand.toLowerCase().includes(query) || products[i].price.toString().includes(query)) {
                results.push(products[i]);
            }
        }
        let filter = JSON.parse(sessionStorage.getItem('filter'));
        filter["brand"] = [];
        filter["rating"] = [];
        filter["price"] = {"min":0,"max":1000000};
        sessionStorage.setItem('filter', JSON.stringify(filter));
        appendFilters();
        if (results.length === 0) {
            $("#product-list")[0].innerHTML = `<img src="/assets/images/no-products.png" class="img-fluid w-auto mx-auto" id="no-product-img"/>`;  
            return;
        }
        else {
            searchProducts = [...results];
            populateProducts(searchProducts);
        }
        
    })
    .catch((error) => {
        $errorToast.find(".toast-body").innerText = error.message;
        $errorToast.show();
    });
}

function goToProduct(id){window.location.href = `/html/productDetails.html?id=${id}`;}

function handlePageClick(event) {
    const val = event.target.innerText;
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
        window.location.href="/html/cart.html";
        return;
    }
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
            $successToast.find(".toast-body")[0].innerText = "Product added to cart";
            $successToast.toast("show");
            event.target.innerText = "GO TO CART";
        }catch(error){
            $errorToast.find(".toast-body")[0].innerText = error.message;
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
            $successToast.find(".toast-body")[0].innerText = "Product added to cart";
            $successToast.toast("show");
            event.target.innerText = "GO TO CART";
        }catch(error){
            let cart = [];
            cart.push({"email":email,"items":[]});
            localStorage.setItem('cart',JSON.stringify(cart));
            $errorToast.find(".toast-body")[0].innerText = error.message;
            $errorToast.show();
        }
    }
}

function closeModal(){$removeItemModal.modal('toggle')}