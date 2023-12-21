var express = require('express');
var router = express.Router();
var {check, validationResult} = require('express-validator');


var mongodb = require('mongodb');
var db = require('monk')('127.0.0.1:27017/E-CommerceDB');

  
/* GET home page. */
router.get('/add', async function(req, res, next) {
  var categories = await db.get('categories');
  var category = await categories.find({}, {});
  res.render('addcategory', {categories:category})
});
  
  
router.post('/add', [
  check('name', 'กรุณาป้อนชื่อหมวดหมู่สินค้า').not().isEmpty()
], async function(req, res, next) {
  var result = validationResult(req);
  var errors = result.errors;
  if (!result.isEmpty()) {
    res.render('addcategory', {
      errors: errors
    });
  } else {
    // Insert DB
    var category = db.get('categories');
    try {
      await category.insert({
        name: req.body.name
      });
      res.location('/');
      res.redirect('/');
    } catch (err) {
      res.send(err);
    }
  }
});


module.exports = router;  
   