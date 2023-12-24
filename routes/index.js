var express = require('express');
var router = express.Router();

var mongodb = require('mongodb');
var db = require('monk')('127.0.0.1:27017/E-CommerceDB');

/* GET home page. */
router.get('/', async function(req, res, next) {
  var categories = await db.get('categories');
  var products = await db.get('products');

  var category = await categories.find({}, {});
  var product = await products.find({}, {});

  res.render('index', {categories:category, products:product});
});
  
module.exports = router;
