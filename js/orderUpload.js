let validOrderItems = [];
const $orderForm = $("#order-upload-form"),
$errorToast = $("#error-toast"),
$errorBody = $errorToast.find(".toast-body"),
$successToast = $("#success-toast"),
$orderList = $("#order-list"),
$errorList = $("#error-list"),
$orderFile = $("#order-file");

$(document).ready(init);

function init(){
    $orderList.hide();
    $orderForm.submit(handleOrderUpload);
    $("#download-sample").click(downloadSample);
    $("#upload-order").click(uploadOrder);
    $errorList.hide();
    $errorToast.click(()=>{$errorToast.hide()});
}

function handleOrderUpload(event){
    event.preventDefault();
    let file = $orderFile[0].files[0];
    if(!file){
        $errorBody[0].innerText = "No file selected";
        $errorToast.show();
        return;
    }
    if(file.type != "text/tab-separated-values"){
        $errorBody[0].innerText = "Please upload correct file";
        $errorToast.show();
        return;
    }
    readFileData(file,readFileDataCallback);
}

function readFileDataCallback(results){
    const fields = results.meta.fields;
    if(fields.length != 2)
    {
        let errorHtml = "<p class='fw-bold'>Errors:</p><li class='text-danger'>Incorrect Number of fields</li>";
        handleError(errorHtml);
        return;
    }
    if(fields[0]!= 'sku_id' || fields[1]!= 'quantity'){
        let errorHtml = "<p class='fw-bold'>Errors:</p><li class='text-danger'>Incorrect headers</li>";
        handleError(errorHtml);
        return;
    }
    const data = results.data;
    if(data.length == 0){
        let errorHtml = "<p class='fw-bold'>Errors:</p><li class='text-danger'>Empty file</li>";
        handleError(errorHtml);
        return;
    }
    if(data.length > 10){
        let errorHtml = "<p class='fw-bold'>Errors:</p><li class='text-danger'>Number of rows exceeds limit(10)</li>";
        handleError(errorHtml);
        return;
    }
    fetch("../assets/data/products.json")
    .then(res=>res.json())
    .then((json)=>{
        const products = json.products;
        let errorFields = [];
        for(let i=0;i<data.length;i++){
            let flag = false;
            let id = -1;
            let title = "";
            products.forEach(p=>{
                if(p.sku_id == data[i].sku_id){
                    id = p.id;
                    title = p.title;
                    flag = true;
                }
            });
            if(!flag){
                errorFields.push("Row no. " + (+i+1) + " : product with sku id " + data[i].sku_id + " does not exist");
            }
            else{
                if(parseInt(data[i].quantity) > 0){
                    let flag = false;
                    let index = -1;
                    for(let j=0;j<validOrderItems.length;j++){
                        if(validOrderItems[j].sku_id === data[i].sku_id){
                            flag = true;
                            index = j;
                            break;
                        }
                    }
                    if(flag===false){
                        validOrderItems.push({id,quantity:data[i].quantity,sku_id:data[i].sku_id,title});
                    }
                    else{
                        validOrderItems[index].quantity = parseInt(validOrderItems[index].quantity) +  parseInt(data[i].quantity);
                    }
                }
                else{
                    errorFields.push("Row no. " + (+i+1) + " : Invalid quantity for sku id " + data[i].sku_id);
                }
            }
        }
        if(errorFields.length > 0){
            let errorHtml = "<p class='fw-bold'>Errors:</p>";
            for(let i=0;i<errorFields.length;i++){
                errorHtml+=`<li class="text-danger">${errorFields[i]}</li>`;
            }
            handleError(errorHtml);
            return;
        }
        if(validOrderItems.length > 0){
            $errorList.hide();
            $orderList.show();
        }
        $orderList.find("tbody")[0].innerHTML = "";
        for(let i=0;i<validOrderItems.length;i++){
            $orderList.find("tbody").append(`<tr class="bg-white"><td>${validOrderItems[i].sku_id}</td><td><a href="/html/productDetails.html?id=${validOrderItems[i].id}" target="_blank">${validOrderItems[i].title}</a></td><td>${validOrderItems[i].quantity}</td></tr>`)
        }
        $orderFile.val(null);
    }).catch(error=>{
        $errorBody[0].innerText = error.message;
        $errorToast.show();
    });
}

function handleError(errorHtml){
    $orderList.hide();
    $errorList[0].innerHTML = errorHtml;
    $errorList.show();
    $orderFile.val(null);
    validOrderItems = [];
    return;
}

function uploadOrder(){
    try{
        let cart = JSON.parse(localStorage.getItem('cart'));
        const email = localStorage.getItem('email');
        let index1 = 0;
        for(let i = 0; i < cart.length; i++) {
            if(cart[i].email===email){
                index1 = i;
                break;
            }
        }
        let items = cart[index1].items;
        for(let i=0;i<validOrderItems.length;i++){
            let flag = false;
            let index2 = 0;
            let id = validOrderItems[i].id;
            for(let i=0; i < items.length; i++) {
                if(items[i].id==id){
                    flag = true;
                    index2 = i;
                    break;
                }
            }
            if(flag)
            {
                items[index2].quantity+=parseInt(validOrderItems[i].quantity);
            }
            else{
                cart[index1].items.push({id:parseInt(id),quantity:parseInt(validOrderItems[i].quantity)});
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartItemCount(email);
        $successToast.find(".toast-body")[0].innerText = "Order placed successfully";
        $successToast.show();
        setTimeout(()=>{$successToast.hide()},3000);
        $orderList.hide();
    }catch(error){
        let cart = [];
        cart.push({"email":email,"items":[]});
        localStorage.setItem('cart',JSON.stringify(cart));
        $errorBody[0].innerText = error.message;
        $errorToast.show();
    }   
}

function readFileData(file, callback) {
    let config = {
        header: true,
        delimiter: "\t",
        skipEmptyLines: "greedy",
        complete: function (results) {
            callback(results);
        }
    }
    Papa.parse(file, config);
}

function downloadSample(){
    let fields = ['sku_id','quantity'];
    let headers = fields.join('\t');
    let blob = new Blob([headers], {type: 'text/tsv;charset=utf-8'});
    let fileUrl = null;
    if (navigator.msSaveBlob) {
        fileUrl = navigator.msSaveBlob(blob, 'sample.tsv');
    } else {
        fileUrl = window.URL.createObjectURL(blob);
    }
    let ele = document.createElement('a');
    ele.href=fileUrl;
    ele.setAttribute('download', 'sample.tsv');
    ele.click();
    ele.remove();
}