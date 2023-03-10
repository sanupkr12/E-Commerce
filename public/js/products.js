let phtl = 0;
let plth = 0;
let rhtl = 0;
let brandFilter = "";
let priceFilter = "";
let ratingFilter = "";

$(document).ready(init);

function init(){
    $("#search-form").submit(handleSearch);
    $("#price-high-to-low").click(addPriceFilterhtl);
    $("#price-low-to-high").click(addPriceFilterlth);
    $("#rating-high-to-low").click(addRatingFilterhtl);
    $("#brand-list").click(addBrandFilter);
    $("#price-range-list").click(addPriceRangeFilter);
    $("#rating-range-list").click(addRatingRangeFilter);
    fetchProducts();
}

function addRatingRangeFilter(event){
    ratingFilter = $(event.target)[0].value.toLowerCase();
    console.log(ratingFilter);
    return;
}

function addBrandFilter(event){
    let products = [];
    page = 1;
    let priceRange = getPriceRange(priceFilter);
    if(searchProducts.length > 0){
        if(priceFilter.length >0){
            for(let i=0;i<searchProducts.length;i++){
                if(searchProducts[i].brand.toLowerCase() === brandFilter){
                    if(searchProducts[i].price >= priceRange["min"] && searchProducts[i].price<priceRange["max"])
                    {
                        products.push(searchProducts[i]);
                    }
                }
            }
        }
        else{
            for(let i=0;i<searchProducts.length;i++){
                if(searchProducts[i].brand.toLowerCase() === brandFilter){
                    products.push(searchProducts[i]);
                }
            }
        }
        searchProducts = [...products];
        populateProducts(products);
    }
    else{
        fetch("/data/products.json")
        .then(res=>res.json())
        .then(data=>{
            if(priceFilter.length >0){
                for(let i=0;i<data.products.length;i++){
                    if(data.products[i].brand.toLowerCase() === brandFilter){
                        if(data.products[i].price >= priceRange["min"] && data.products[i].price<priceRange["max"])
                        {
                            products.push(data.products[i]);
                        }
                    }
                }
            }
            else{
                for(let i=0;i<data.products.length;i++){
                    if(data.products[i].brand.toLowerCase() === brandFilter){
                        products.push(data.products[i]);
                    }
                }
            }
            searchProducts = [...products];
            populateProducts(products); 
        });
    }  
}
function addPriceRangeFilter(event){
    priceFilter = $(event.target)[0].value.toLowerCase();
    let products = [];
    page = 1;
    let priceRange = getPriceRange(priceFilter);
        if(searchProducts.length > 0){
            if(brandFilter.length > 0){
                for(let i=0;i<searchProducts.length;i++){
                    if(searchProducts[i].brand.toLowerCase() === brandFilter){
                        if(searchProducts[i].price >= priceRange["min"] && searchProducts[i].price<priceRange["max"])
                        {
                            products.push(searchProducts[i]);
                        }
                    }
                }
            }
            else{
                for(let i=0;i<searchProducts.length;i++){
                    if(searchProducts[i].price >= priceRange["min"] && searchProducts[i].price<priceRange["max"])
                        {
                            products.push(searchProducts[i]);
                        }
                }
            }
            searchProducts = [...products];
            populateProducts(products);
        }
        else{
            fetch("/data/products.json")
        .then(res=>res.json())
        .then(data=>{
            
            if(brandFilter.length > 0){
                for(let i=0;i<data.products.length;i++){
                    if(data.products[i].brand.toLowerCase() === brandFilter){
                        if(data.products[i].price >= priceRange["min"] && data.products[i].price<priceRange["max"])
                        {
                            products.push(data.products[i]);
                        }
                    }
                }
            }
            else{
                for(let i=0;i<data.products.length;i++){
                    if(data.products[i].price >= priceRange["min"] && data.products[i].price<priceRange["max"])
                        {
                            products.push(data.products[i]);
                        }
                }
            }
            searchProducts = [...products];
            populateProducts(products);
        });
        } 
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
    phtl = 1;
    plth = 0;
    $("#sort-rating")[0].innerText = "price-high-to-low";
    $("#price-high-to-low").addClass("bg-secondary");
    $("#price-low-to-high").removeClass("bg-secondary");
    $("#rating-high-to-low").removeClass("bg-secondary");
    if(searchProducts.length > 0){
          if(rhtl){
            searchProducts.sort( compareRatinghtl );
          }
          searchProducts.sort( comparePricehtl );
          populateProducts(searchProducts);
    }
    else{
        fetch("/data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
            totalItem = products.length;
            if(rhtl){
                products.sort( compareRatinghtl );
              }
            products.sort( comparePricehtl );
            populateProducts(products);
        });
    }
}
function addPriceFilterlth(){
    phtl = 0;
    plth = 1;
    $("#sort-rating")[0].innerText = "price-low-to-high";
    $("#price-low-to-high").addClass("bg-secondary");
    $("#price-high-to-low").removeClass("bg-secondary");
    $("#rating-high-to-low").removeClass("bg-secondary");
    if(searchProducts.length > 0){
        if(rhtl){
            searchProducts.sort( compareRatinghtl );
          }
          searchProducts.sort( comparePricelth );
          populateProducts(searchProducts);
    }
    else{
        fetch("/data/products.json")
        .then((response) => response.json())
        .then((json) => {
            let products = json.products;
            totalItem = products.length;
            if(rhtl){
                products.sort( compareRatinghtl );
              }
            products.sort( comparePricelth );
            populateProducts(products);
        });
    }
}
function addRatingFilterhtl(){
    rhtl = 1;
    $("#sort-rating")[0].innerText = "rating-high-to-low";
    $("#price-low-to-high").removeClass("bg-secondary");
    $("#price-high-to-low").removeClass("bg-secondary");
    $("#rating-high-to-low").addClass("bg-secondary");
    if(searchProducts.length > 0){
        if(phtl){
            searchProducts.sort( comparePricehtl );
        }
        if(plth){
            searchProducts.sort( comparePricelth );
        }
        searchProducts.sort( compareRatinghtl );
        populateProducts(searchProducts);
    }
  else{
      fetch("/data/products.json")
      .then((response) => response.json())
      .then((json) => {
          let products = json.products;
          totalItem = products.length;
          if(phtl){
            products.sort( comparePricehtl );
          }
          if(plth){
            products.sort( comparePricelth );
          }
          products.sort( compareRatinghtl );
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
                if (products[i].description.toLowerCase().includes(query) || products[i].title.toLowerCase().includes(query)) {
                    results.push(products[i]);
                }
            }
            if (results.length === 0) {
                alert("No products to show");
            }
            else {
                searchProducts = [...results];
                $("#sort-rating")[0].innerText = "Sort By";
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

        for(let i=0;i<products.length;i++){
            brandList.push(products[i].brand);
        }

        brandList = [...new Set(brandList)];
        $("#brand-list")[0].innerHTML = "";
        for(let i=0;i<brandList.length;i++)
        {
            $("#brand-list").append(`<li><a class="dropdown-item" href="#"><div class="form-check">
            <input class="form-check-input" type="checkbox" value="${brandList[i]}" id="brand-${brandList[i]}" />
            <label class="form-check-label" for="brand-${brandList[i]}">${brandList[i]}</label>
        </div></a></li>`);
        }
        let productHtml = "";
        for (let i = (limit * (page - 1)); i < ((limit * (page - 1) + limit) > products.length ? products.length :(limit * (page - 1) + limit)); i++) {
            let product = products[i];
            let email = localStorage.getItem("email");

            if(!email){
                let untrackedItems = localStorage.getItem("untrackedItems");
                for(let i = 0; i < untrackedItems.length;i++){
                    if(untrackedItems[i].id === product.id){
                        productHtml += `<div class="col-lg-3 col-md-6 mb-3">
                        <div class="card rounded-1 shadow product-box mx-auto">
                            <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                            <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                            <span class="card-rating-box">${product.rating} ⭐</span>
                            </div>
                            <div class="card-body">
                                <h4 class="card-title mt-1 card-title-text hover-pointer" onclick="goToProduct(${product.id})">${product.title}</h4>
                                <h5>${"₹ " + product.price}</h5>
                                <p class="card-text card-description-text">${product.description}</p>
                                <div class="input-group w-auto">
                                <button class="btn btn-warning"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                                <input type="number" step="1" min="0" class="w-25 p-1 form-control d-inline num-input" id="${"input-" + product.id}" value=${untrackedItems[i].quantity} readonly="true">
                                <button class="btn btn-warning"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
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
                    productHtml += `<div class="col-lg-3 col-md-6 mb-3">
                        <div class="card rounded-1 shadow product-box mx-auto" >
                            <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                            <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                            <span class="card-rating-box">${product.rating} ⭐</span>
                            </div>
                            <div class="card-body">
                                <h4 class="card-title mt-1 card-title-text hover-pointer" onclick="goToProduct(${product.id})">${product.title}</h4>
                                <h5>${"₹ " + product.price}</h5>
                                <p class="card-text card-description-text">${product.description}</p>
                                <div class="input-group w-auto">
                                <button class="btn btn-warning"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                                <input type="number" step="1" min="0" class="w-25 p-1 form-control d-inline num-input" id="${"input-" + product.id}" value=${cartEntry[index1].items[index2].quantity} readonly="true">
                                <button class="btn btn-warning"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
                                </div>
                            </div> 
                            </div>
                            </div>`;
                }
                else{
                        productHtml += `<div class="col-lg-3 col-md-6 mb-3">
                            <div class="card rounded-1 shadow product-box mx-auto" >
                                <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
                                <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                                <span class="card-rating-box">${product.rating} ⭐</span>
                                </div>
                                <div class="card-body">
                                    <h4 class="card-title mt-1 card-title-text hover-pointer" onclick="goToProduct(${product.id})">${product.title}</h4>
                                    <h5>${"₹ " + product.price}</h5>
                                    <p class="card-text card-description-text">${product.description}</p>
                                    <div class="input-group w-auto">
                                    <button class="btn btn-warning"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
                                    <input type="number" step="1" min="0" class="w-25 p-1 form-control d-inline num-input" id="${"input-" + product.id}" value="0" readonly="true">
                                    <button class="btn btn-warning"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button>
                                    </div>
                                </div> 
                                </div>
                                </div>`;
                }
                
            }
            
        }
        productHtml += `<nav aria-label="Page navigation example" class="d-flex justify-content-center">
<ul class="pagination">
<li class="page-item"><a class="page-link" href="#">Previous</a></li>`;
        let itemCount = products.length / limit;
        for (let i = 0; i < itemCount; i++) {
            productHtml += `<li class="page-item"><a class="page-link" href="#">${+i + 1}</a></li>`
        }
        productHtml += `<li class="page-item"><a class="page-link" href="#">Next</a></li>
</ul>
</nav>`;
        $("#product-list")[0].innerHTML = productHtml;
        $(".page-link").click(handlePageClick);
}
// <a class="btn btn-sm btn-warning mt-2 w-100 py-1 fs-5 add-btn" onclick="addProduct(${product.id},event)">ADD TO CART</a>
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
