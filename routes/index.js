var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var Vote = require('../models/vote');
var User2 = require('../models/user2');



router.get('/', function(req, res, next){
  res.render('index', {title: 'index', layout: 'pre'});
});
module.exports = router;
