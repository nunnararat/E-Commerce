var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongodb = require('mongodb');
var db = require('monk')('127.0.0.1:27017/E-CommerceDB');
   
var indexRouter = require('./routes/index');
var categoryRouter = require('./routes/categories');
var productRouter = require('./routes/products');

var session = require('express-session');
var stripe = require('stripe')('sk_test_51OPoQRCiex5v2AD1yIh21oxBK0rx9TQq2xX8CyGYTIs6R07GWyLMGn1AZALEdralFiODdo8QfV9kWf6R1DQd5Qg2008WsRm5vp');
   
var app = express();     
// view engine setup  
app.set('views', path.join(__dirname, 'views'));     
app.set('view engine', 'ejs');      
          
app.use(logger('dev'));   
app.use(express.json());
app.use(express.urlencoded({ extended: false }));  
app.use(cookieParser());    
  
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use(express.static(path.join(__dirname, 'public'))); 

app.locals.descriptionText = function(text, length) {
  return text.substring(0, length);
}
app.locals.formatMoney = function(number) {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

app.post('/payment', async function(req, res) {
  var token = req.body.stripeToken; // วิธีการที่เราชำระเงิน
  var amount = req.body.amount; // จำนวนเงิน

  // โอนเงินเข้าบัญชี
  var charge = await stripe.charges.create({
      amount: amount,
      currency: "thb",
      source: token
  });
  req.session.destroy();
  res.redirect("/");
})

app.use('/', indexRouter);  
app.use('/categories', categoryRouter)
app.use('/products', productRouter);
   

module.exports = app;
  