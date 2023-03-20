function generateCartHtml(results){
    let productHtml = "";
    for (let i = 0; i < results.length; i++) {
        productHtml += `<div class="card mb-3 border-0 shadow-sm">
        <div class="card-body row no-gutters py-2">
            <div class="col-md-4 p-2">
            <a href="../html/productDetails.html?id=${results[i].product.id}">
            <img src=${results[i].product.thumbnail} class="h-100 w-100 rounded" alt="...">
            </a>
            </div>
            <div class="col-md-8">
            <div class="card-body position-relative">
            <button onclick="handleRemoveModal(${results[i].product.id},${results[i].product.price},event)" data-bs-toggle = "tooltip" data-bs-placement="bottom" title="Remove from cart" class="btn btn-outline-danger btn-sm border-0 end-0 position-absolute top-0"><i class="fa fa-solid fa-trash fs-5 mt-2"></i></button>
            <a href="../html/productDetails.html?id=${results[i].product.id}">
                <h5 class="card-title product-title">${results[i].product.title}</h5>
                </a>
                <p class="card-text">${results[i].product.description}</p>
                <h5 class="card-text"><small class="fw-light">${"₹ " + results[i].product.price.toLocaleString('en-IN')}</small></h5>
                <div class="d-flex align-items-center">
                <button class="btn btn-warning"  onclick="decreaseQuantityOnCart(${results[i].product.id},${results[i].product.price},event)">-</button>
                <input type="number" step="1" min="0" class="w-input form-control d-inline num-input mx-1 text-center" id="${"input-" + results[i].product.id}" value=${results[i].quantity} readonly="true">
                <button class="btn btn-warning"  onclick="increaseQuantityOnCart(${results[i].product.id},${results[i].product.price},event)">+</button>
                </div>
            </div>
            </div>
        </div>
        </div>`;
    }

    return productHtml;
}

function generateProductHtml(product,quantity){
    let productHtml = `<div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
    <div class="card rounded-1 shadow-sm border-0 product-box mx-auto" >
        <div class="card-header card-header-text p-0 hover-pointer" onclick="goToProduct(${product.id})">
        <img src="${product.thumbnail}" class="card-img-top img-fluid card-image-size">
        <span class="card-rating-box">${product.rating} ⭐</span>
        </div>
        <div class="card-body">
            <h5 class="card-title mt-1 card-title-text hover-pointer fw-normal text-muted" onclick="goToProduct(${product.id})">${product.title}</h5>
            
            <p class="card-text card-description-text">${product.description}</p>
            <div class="d-flex align-items-center justify-content-between">
            <h6 class="text-nowrap">${"₹ " + product.price.toLocaleString('en-IN')}</h6>
            <div class="d-flex justify-content-end align-items-center">
            <button class="btn btn-warning py-1"  onclick="decreaseQuantityOnProduct(${product.id},event)">-</button>
            <input type="number" step="1" min="0" class="w-input-product-card p-1 form-control d-inline num-input text-center mx-1" id="${"input-" + product.id}" value=${quantity} readonly="true">
            <button class="btn btn-warning py-1"  onclick="increaseQuantityOnProduct(${product.id},event)">+</button></div>
           
            </div>
        </div> 
        </div>
        </div>`;
    return productHtml;
}

function addBrand(brand,checked){
    if(checked){
        return `<div class="form-check">
        <input class="form-check-input" checked type="checkbox" name="${brand}" id="brand-${brand}">
        <label class="form-check-label" for="brand-${brand}">
        ${brand}
        </label>
        </div>`
    }
    else{
        return  `<div class="form-check">
        <input class="form-check-input" type="checkbox" name="${brand}" id="brand-${brand.toLowerCase()}">
        <label class="form-check-label" for="brand-${brand.toLowerCase()}">
        ${brand}
        </label>
        </div>`;
    }
}