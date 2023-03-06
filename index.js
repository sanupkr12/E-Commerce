const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {   
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/login',(req,res)=>{
    res.sendFile(__dirname + '/public/html/login.html');
});

app.get('/products',(req,res)=>{
    res.sendFile(__dirname + '/public/html/products.html');
});

app.get('/signup',(req,res)=>{
    res.sendFile(__dirname + '/public/html/signup.html');
})

app.get('/products/:id',(req,res)=>{
    res.sendFile(__dirname + '/public/html/productDetails.html');
});

app.get('/cart',(req,res)=>{
    res.sendFile(__dirname + '/public/html/cart.html');
});

app.get('/order',(req,res)=>{
    res.sendFile(__dirname + '/public/html/upload.html');
})

app.listen(3000,(err)=>{
    if(!err){
        console.log('server is running on port 3000');
    } 
});