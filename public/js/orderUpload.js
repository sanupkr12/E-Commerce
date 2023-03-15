let validOrderItems = [];
$(document).ready(init);

function init(){
    $("#order-list").hide();
    $("#order-upload-form").submit(handleOrderUpload);
    $("#download-sample").click(downloadSample);
    $("#upload-order").click(uploadOrder);
    $("#error-list").hide();
    $("#error-toast").click(()=>{$('#error-toast').hide()});
}

function handleOrderUpload(event){
    event.preventDefault();
    let file = $("#order-file")[0].files[0];
    if(!file){
        $("#error-toast  .toast-body")[0].innerText = "No file selected";
        $("#error-toast").show();
        return;
    }
    
    if(file.type != "text/tab-separated-values"){
        $("#error-toast  .toast-body")[0].innerText = "Please upload correct file";
        $("#error-toast").show();
        return;
    }
    readFileData(file,readFileDataCallback);
}

function readFileDataCallback(results){
    let fields = results.meta.fields;
    if(fields.length != 2)
    {
        $("#error-toast .toast-body")[0].innerText = "Incorrect Number of fields";
        $("#error-toast").show();
        return; 
    }
    if(fields[0]!= 'sku_id' || fields[1]!= 'quantity'){
        $("#error-toast .toast-body")[0].innerText = "Incorrect headers";
        $("#error-toast").show();
        return;
    }
    let data = results.data;
    if(data.length > 10){
        $("#error-toast .toast-body")[0].innerText = "Number of rows exceeds limit(10)";
        $("#error-toast").show();
    }
    fetch("../data/products.json")
    .then(res=>res.json())
    .then((json)=>{
        let products = json.products;
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
                console.log(data[i].quantity);
                if(parseInt(data[i].quantity) > 0){
                    validOrderItems.push({id,quantity:data[i].quantity,sku_id:data[i].sku_id,title});
                }
                else{
                    errorFields.push("Row no. " + (+i+1) + " : Invalid quantity for " + data[i].sku_id);
                }
            }
        }
        if(errorFields.length > 0){
            let errorHtml = "<p>Errors:</p>";
            for(let i=0;i<errorFields.length;i++){
                errorHtml+=`<li class="text-danger">${errorFields[i]}</li>`;
            }
            $("#order-list").hide();
            $("#error-list").show();
            $("#error-list")[0].innerHTML = errorHtml;
            return;
        }
        
        if(validOrderItems.length > 0){
            $("#error-list").hide();
            $("#order-list").show();
        }
        for(let i=0;i<validOrderItems.length;i++){
            $("#order-list").find("tbody").append(`<tr class="bg-white"><td>${validOrderItems[i].sku_id}</td><td>${validOrderItems[i].title}</td><td>${validOrderItems[i].quantity}</td></tr>`)
        }
    });
}

function uploadOrder(){
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
        $("#success-toast .toast-body")[0].innerText = "Order placed successfully";
        $("#success-toast").show();
        $("#order-list").hide();
        setTimeout(()=>{
            $("#success-toast").hide();
        },3000);
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