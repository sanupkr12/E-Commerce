let phtl = 0;
let plth = 0;
let rhtl = 0;
let brandFilter = "";
let priceFilter = "";
$(document).ready(init);

function init(){
    $("#search-form").submit(handleSearch);
    $("#price-high-to-low").click(addPriceFilterhtl);
    $("#price-low-to-high").click(addPriceFilterlth);
    $("#rating-high-to-low").click(addRatingFilterhtl);
    $("#brand-list").click(addBrandFilter);
    $("#price-range-list").click(addPriceRangeFilter);
    fetchProducts();
}

function addBrandFilter(event){
    brandFilter = $(event.target)[0].innerText.toLowerCase();
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
    priceFilter = $(event.target)[0].innerText.toLowerCase();
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
                for(let i=0;i<data.products.length;i++){
                    if(data.products[i].price >= priceRange["min"] && data.products[i].price<priceRange["max"])
                        {
                            products.push(data.products[i]);
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
    if(priceFilter === "0 - 1000"){
        return {min:0,max:1000};
    }else if(priceFilter === "1000 - 2500"){
        return {min:1000,max:2500};
    }else if(priceFilter === "2500 - 5000"){
        return {min:2500,max:5000};
    }
    else{
        return {min:5000,max:10000000};
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
    $("#price-high-to-low").addClass("bg-primary");
    $("#price-low-to-high").removeClass("bg-primary");
    $("#rating-high-to-low").removeClass("bg-primary");
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
    $("#price-low-to-high").addClass("bg-primary");
    $("#price-high-to-low").removeClass("bg-primary");
    $("#rating-high-to-low").removeClass("bg-primary");
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
    $("#price-low-to-high").removeClass("bg-primary");
    $("#price-high-to-low").removeClass("bg-primary");
    $("#rating-high-to-low").addClass("bg-primary");
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
            $("#brand-list").append(`<li><a class="dropdown-item" href="#">${brandList[i]}</a></li>`);
        }
        let productHtml = "";
        for (let i = (limit * (page - 1)); i < ((limit * (page - 1) + limit) > products.length ? products.length :(limit * (page - 1) + limit)); i++) {
            let product = products[i];
            productHtml += `<div class="col-lg-3 col-md-6 mb-3">
            <div class="card rounded-1 shadow product-box mx-auto" onclick="goToProduct(${product.id})">
                <div class="card-header card-header-text p-0">
                <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
                <span class="card-rating-box">${product.rating} ⭐</span>
                </div>
                <div class="card-body">
                    <h4 class="card-title mt-1 card-title-text">${product.title}</h4>
                    <h5>${"₹ " + product.price}</h5>
                    <p class="card-text card-description-text">${product.description}</p>
                    <a class="btn btn-sm btn-warning mt-2 w-100 py-1 fs-5 add-btn" onclick="addProduct(${product.id},event)">ADD TO CART</a>
                </div> 
        </div>
        </div>`;
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