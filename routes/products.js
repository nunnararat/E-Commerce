var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');

var mongodb = require('mongodb');
var db = require('monk')('127.0.0.1:27017/E-CommerceDB');
    
/* GET home page. */
router.get('/', async function(req, res, next) {
  var categories = db.get('categories');
  var category = await categories.find({}, {});
  res.render('addproduct', {
    categories: category    
  });  
});

router.get('/show/:id', async function(req, res, next) {
  var categories = await db.get('categories');
  var products = await db.get('products');

  var category = await categories.find({}, {});
  var product = await products.find(req.params.id, {});

  res.render('show', {categories:category, products:product})
});

router.get('/show/', async function(req, res, next) {
  var categories = await db.get('categories');
  var products = await db.get('products');
  
  var categoryname = req.query.category;

  var category = await categories.find({}, {});
  var product = await products.find({category:categoryname}, {});

  res.render('searchproduct', {categories:category, products:product})
});


router.get('/cart', async function(req, res, next) {
  var cart = req.session.cart; //ตะกร้าสินค้า
  var displayCart = {items:[], total:0};
  var result = 0;
  for(item in cart){
      displayCart.items.push(cart[item]);
      result += (cart[item].qty * cart[item].price);
  }
  displayCart.total = result;
  res.render('cart',{cart:displayCart});
});

router.post('/add', [    
  check('name', 'กรุณาป้อนชื่อสินค้า').not().isEmpty(),
  check('description', 'กรุณาป้อนรายละเอียดสินค้า').not().isEmpty(),
  check('price', 'กรุณาป้อนราคาสินค้า').not().isEmpty(),
  check('img', 'กรุณาป้อนภาพสินค้า').not().isEmpty()   
], async function(req, res, next) {
  var result = validationResult(req);
  var errors = result.errors;

  var categories = await db.get('categories');
  var products = await db.get('products');
    
  if(!result.isEmpty()){ 
    var categories = db.get('categories');
    var category = await categories.find({}, {});       
    res.render('addproduct', {   
      categories: category,
      errors: errors
    });
  }else{
    // insert data
    try{
      products.insert({
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),  
        img: req.body.img,
        category: req.body.category  
      })

      res.location('/');
      res.redirect('/');
    }catch(error){
      res.send(error)
    }
  }
});

router.post('/cart/', async function(req, res, next) {
  var product_id = req.body.product_id;

  // จองพื้นที่ตะกร้าสินค้า
  req.session.cart = req.session.cart || {};

  // ตะกร้าสินค้า
  var cart = req.session.cart;

  var products = await db.get('products');
  var product = await products.find({_id:product_id}, {});

  // กรณีซื้อสินค้าชิ้นเดิม มากกว่า 1 ชิ้น
  if(cart[product_id]){    
    cart[product_id].qty++;
  }else{
    // ซื้อสินค้าชิ้นนี้ครั้งแรก
    // loop array cart เพื่อ เก็บข้อมูล
    product.forEach((item)=> {
      cart[product_id] = {
        item: item._id,
        title: item.name,
        price: item.price,
        qty: 1
      }
    });
  }
  res.redirect('/');
  // card id, name, price, quantity(qty)
});



module.exports = router;
