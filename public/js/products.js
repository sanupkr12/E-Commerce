$(document).ready(init);

function init(){
    $("#search-form").submit(handleSearch);
    $("#price-high-to-low").click(addPriceFilterhtl);
    $("#price-low-to-high").click(addPriceFilterlth);
    $("#rating-high-to-low").click(addRatingFilterhtl);
    $("#brand-list").click(addBrandFilter);
    $("#price-range-list").click(addPriceRangeFilter);
    $("#rating-range-list").click(addRatingRangeFilter);
    $("#reset-filter").click(resetFilter);
    fetchProducts();
}

function resetFilter(event){
    event.preventDefault();
    sessionStorage.clear();
    location.reload();
}

function addRatingRangeFilter(event){
    let ratingFilter = $(event.target)[0].value.toLowerCase();
    let ratingFilters = sessionStorage.getItem("ratingFilters");
    let ratingFiltersArray = []
    if(ratingFilters!=null){
        ratingFiltersArray = ratingFilters.split(",");
    }
    
    let flag = false;
    for(let i=0;i<ratingFiltersArray.length;i++){
        if(ratingFiltersArray[i].toLowerCase() === ratingFilter){
            flag = true;
            break;
        }
    }

    if(flag===true){
        sessionStorage.setItem("ratingFilters",ratingFiltersArray.filter((item)=>item.toLowerCase()!= ratingFilter).join(","));
    }
    else{
        ratingFiltersArray.push(ratingFilter);
        sessionStorage.setItem("ratingFilters",ratingFiltersArray.join(","));
    }

    if(searchProducts.length > 0){
        searchProducts = applyFilter(searchProducts);
        searchProducts = applySort(searchProducts);
        populateProducts(searchProducts);
    }
    else{
        fetch("/data/products.json")
        .then(res=>res.json())
        .then(data=>{
            let products = data.products;
            products = applyFilter(products);
            products = applySort(products);
            populateProducts(products);
        });
    } 
}

function addBrandFilter(event){
    let brandFilter = $(event.target)[0].value.toLowerCase();
    let brandFilters = sessionStorage.getItem("brandFilters");
    let brandFiltersArray = [];
    if(brandFilters!=null){
        brandFiltersArray = brandFilters.split(",");
    }
        
    let flag = false;
    for(let i=0;i<brandFiltersArray.length;i++){
        if(brandFiltersArray[i].toLowerCase() === brandFilter){
            flag = true;
            break;
        }   
    }

    if(flag){
        sessionStorage.setItem("brandFilters",brandFiltersArray.filter((item)=>item.toLowerCase()!= brandFilter).join(","));
    }
    else{
        brandFiltersArray.push(brandFilter);
        sessionStorage.setItem("brandFilters",brandFiltersArray.join(","));
    }
    page = 1;
    if(searchProducts.length > 0){
        searchProducts = applyFilter(searchProducts);
        searchProducts = applySort(searchProducts);
        populateProducts(searchProducts);
    }
    else{
        fetch("/data/products.json")
        .then(res=>res.json())
        .then(data=>{
            let products = data.products;
            products = applyFilter(products);
            products = applySort(products);
            populateProducts(products);
        });
    }  
}
function addPriceRangeFilter(event){
    let priceFilter = $(event.target)[0].value.toLowerCase();
    if(priceFilter.length <=0){
        return;
    }
    page = 1;
    let priceFilters = sessionStorage.getItem("priceRangeFilters");
    let priceFiltersArray = [];
    if(priceFilters!=null){
        priceFiltersArray = priceFilters.split(",");
    }

    let flag = false;
    for(let i=0;i<priceFiltersArray.length;i++){
        if(priceFiltersArray[i].toLowerCase() === priceFilter){
            flag = true;
            break;
        }
    }
    if(flag===true){
        sessionStorage.setItem("priceRangeFilters",priceFiltersArray.filter((item)=>item.toLowerCase()!= priceFilter).join(","));
    }
    else{
        priceFiltersArray.push(priceFilter);
        sessionStorage.setItem("priceRangeFilters",priceFiltersArray.join(","));
    }

    if(searchProducts.length > 0){
        searchProducts = applyFilter(searchProducts);
        searchProducts = applySort(searchProducts);
        populateProducts(searchProducts);
    }
    else{
        fetch("/data/products.json")
    .then(res=>res.json())
    .then(data=>{
        let products = data.products;
        products = applyFilter(products);
        products = applySort(products);
        populateProducts(products);
    });
    } 
}

function applyFilter(products){
    let brandFilters  = sessionStorage.getItem("brandFilters");
    let priceRangeFilters = sessionStorage.getItem("priceRangeFilters");
    let ratingFilters = sessionStorage.getItem("ratingFilters");
    let res = [];
    if(brandFilters){
        brandFilters = brandFilters.split(",");
        if(brandFilters.length>0){
            for(let i=0;i<products.length;i++){
                for(let j=0;j<brandFilters.length;j++){
                    if(products[i].brand.toLowerCase()===brandFilters[j].toLowerCase()){
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
        priceRangeFilters = priceRangeFilters.split(",");
        if(priceRangeFilters.length >0){
            for(let i=0;i<products.length;i++){
                for(let j=0;j<priceRangeFilters.length;j++){
                    let priceRange = getPriceRange(priceRangeFilters[j]);
                    if(products[i].price >= priceRange["min"] && products[i].price<priceRange["max"]){
                        res.push(products[i]);
                        break;
                    }
                }
            }
            products = [...res];
        }
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
            products = [...res];
        }
    }
    return products;
}

function applySort(products){
    let phtl = sessionStorage.getItem("phtl");
    let rhtl = sessionStorage.getItem("rhtl");
    
    if(phtl!=null){
        if(phtl == 1){
            products.sort(comparePricehtl);
        }
        else if(phtl == -1){
            products.sort(comparePricelth);
        }
    }
    if(rhtl!=null){
        if(rhtl == 1){
            products.sort(compareRatinghtl);
        }
    }
    return products;
}

function getPriceRange(priceFilter){
    if(priceFilter === "0 - 10000"){
        return {min:0,max:10000};
    }else if(priceFilter === "10000 - 25000"){
        return {min:10000,max:25000};
    }else if(priceFilter === "25000 - 50000"){
        return {min:25000,max:50000};
    }
    else{
        return {min:50000,max:10000000};
    }

}

function getRatingRange(ratingFilter){
    if(ratingFilter === "0 - 1"){
        return {min:0,max:1};
    }
    else if(ratingFilter === "1 - 2"){
        return {min:1,max:2};
    }
    else if(ratingFilter === "2 - 3"){
        return {min:2,max:3};
    }
    else if(ratingFilter === "3 - 4"){
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

function addPriceFilterhtl(){
    sessionStorage.setItem("phtl",1);
    sessionStorage.setItem("rhtl",0);
    $("#sort-rating")[0].innerText = "price-high-to-low";
    $("#price-high-to-low").addClass("bg-secondary");
    $("#price-low-to-high").removeClass("bg-secondary");
    $("#rating-high-to-low").removeClass("bg-secondary");
    if(searchProducts.length > 0){
          searchProducts = applyFilter(searchProducts);
          searchProducts = applySort(searchProducts);
          populateProducts(searchProducts);
    }
    else{
        fetch("/data/products.json")
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
function addPriceFilterlth(){
    sessionStorage.setItem("phtl",-1);
    sessionStorage.setItem("rhtl",0);
    $("#sort-rating")[0].innerText = "price-low-to-high";
    $("#price-low-to-high").addClass("bg-secondary");
    $("#price-high-to-low").removeClass("bg-secondary");
    $("#rating-high-to-low").removeClass("bg-secondary");
    if(searchProducts.length > 0){
        searchProducts = applyFilter(searchProducts);
          searchProducts = applySort(searchProducts);
          populateProducts(searchProducts);
    }
    else{
        fetch("/data/products.json")
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
function addRatingFilterhtl(){
    sessionStorage.setItem("rhtl",1);
    sessionStorage.setItem("phtl",0);
    $("#sort-rating")[0].innerText = "rating-high-to-low";
    $("#price-low-to-high").removeClass("bg-secondary");
    $("#price-high-to-low").removeClass("bg-secondary");
    $("#rating-high-to-low").addClass("bg-secondary");
    if(searchProducts.length > 0){
        searchProducts = applyFilter(searchProducts);
          searchProducts = applySort(searchProducts);
          populateProducts(searchProducts);
    }
  else{
      fetch("/data/products.json")
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

function handleSearch(event) {
    event.preventDefault();
    page = 1;
    let query = $("#search-input")[0].value.toLowerCase();
    fetch("/data/products.json")
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
                $("#sort-rating")[0].innerText = "Relevance";
                sessionStorage.clear();
                populateProducts(results);
            }
        });
}

function fetchProducts() {
    fetch("./data/products.json")
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
        if((limit * (page - 1))>products.length )
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
            $("#brand-list")[0].innerHTML = "";
            if(brandFilters!=null){
                let brandFiltersArray = brandFilters.split(",");
                for(let i=0;i<brandList.length;i++)
                {
                    let flag=false;
                    for(let j=0;j<brandFiltersArray.length;j++){
                        if(brandFiltersArray[j].toLowerCase()===brandList[i].toLowerCase())
                        {
                            flag = true;
                            $("#brand-list").append(`<li><a class="dropdown-item" href="#"><div class="form-check">
                            <input class="form-check-input" type="checkbox"checked value="${brandList[i]}" id="brand-${brandList[i]}" />
                            <label class="form-check-label" for="brand-${brandList[i]}">${brandList[i]}</label>
                            </div></a></li>`);
                            break;
                        }
                    }
                    if(flag===false){
                        $("#brand-list").append(`<li><a class="dropdown-item" href="#"><div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${brandList[i]}" id="brand-${brandList[i]}" />
                            <label class="form-check-label" for="brand-${brandList[i]}">${brandList[i]}</label>
                        </div></a></li>`);
                    }
                }
            }
            else{
                for(let i=0;i<brandList.length;i++)
                {
                    $("#brand-list").append(`<li><a class="dropdown-item" href="#"><div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${brandList[i]}" id="brand-${brandList[i]}" />
                            <label class="form-check-label" for="brand-${brandList[i]}">${brandList[i]}</label>
                        </div></a></li>`);
                }
            }  
        }
        else{
            fetch("/data/products.json")
            .then(res=>res.json())
            .then(data=>{
                for(let i=0;i<data.products.length;i++){
                    brandList.push(data.products[i].brand);
                }
                brandList = [...new Set(brandList)];
                let brandFilters = sessionStorage.getItem('brandFilters');

                $("#brand-list")[0].innerHTML = "";
                if(brandFilters!=null){
                    let brandFiltersArray = brandFilters.split(",");
                    for(let i=0;i<brandList.length;i++)
                    {
                        let flag=false;
                        for(let j=0;j<brandFiltersArray.length;j++){
                            if(brandFiltersArray[j].toLowerCase()===brandList[i].toLowerCase())
                            {
                                flag = true;
                                $("#brand-list").append(`<li><a class="dropdown-item" href="#"><div class="form-check">
                                <input class="form-check-input" type="checkbox"checked value="${brandList[i]}" id="brand-${brandList[i]}" />
                                <label class="form-check-label" for="brand-${brandList[i]}">${brandList[i]}</label>
                                </div></a></li>`);
                                break;
                            }
                        }
                        if(flag===false){
                            $("#brand-list").append(`<li><a class="dropdown-item" href="#"><div class="form-check">
                                <input class="form-check-input" type="checkbox" value="${brandList[i]}" id="brand-${brandList[i]}" />
                                <label class="form-check-label" for="brand-${brandList[i]}">${brandList[i]}</label>
                            </div></a></li>`);
                        }
                    }
                }
                else{
                    for(let i=0;i<brandList.length;i++)
                    {
                        $("#brand-list").append(`<li><a class="dropdown-item" href="#"><div class="form-check">
                                <input class="form-check-input" type="checkbox" value="${brandList[i]}" id="brand-${brandList[i]}" />
                                <label class="form-check-label" for="brand-${brandList[i]}">${brandList[i]}</label>
                            </div></a></li>`);
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
                for(let i = 0; i < untrackedItems.length;i++){
                    if(untrackedItems[i].id === product.id){
                        productHtml += `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                        <div class="card rounded-1 shadow product-box mx-auto">
                            <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                            <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                            <span class="card-rating-box">${product.rating} ⭐</span>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title mt-1 card-title-text hover-pointer" onclick="goToProduct(${product.id})">${product.title}</h5>
                                <h6>${"₹ " + product.price}</h6>
                                <p class="card-text card-description-text">${product.description}</p>
                                <div>
                                <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                                <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center" id="${"input-" + product.id}" value=${untrackedItems[i].quantity} readonly="true">
                                <button class="btn btn-warning py-1"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
                                </div>
                            </div> 
                            </div>
                            </div>`;
                        break;
                    }
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
                                <h5 class="card-title mt-1 card-title-text hover-pointer" onclick="goToProduct(${product.id})">${product.title}</h5>
                                <h6>${"₹ " + product.price}</h6>
                                <p class="card-text card-description-text">${product.description}</p>
                                <div>
                                <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                                <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center" id="${"input-" + product.id}" value=${cartEntry[index1].items[index2].quantity} readonly="true">
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
                                <h5 class="card-title mt-1 card-title-text hover-pointer" onclick="goToProduct(${product.id})">${product.title}</h4>
                                <h6>${"₹ " + product.price}</h6>
                                <p class="card-text card-description-text">${product.description}</p>
                                <div>
                                <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                                <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center" id="${"input-" + product.id}" value="0" readonly="true">
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
    window.location.href = `http://localhost:3000/products/${id}`;
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
        window.location.href="http://localhost:3000/cart";
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
