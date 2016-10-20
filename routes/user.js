var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var Vote = require('../models/vote');
var User2 = require('../models/user2');
var csrf = require('csurf');
var session = require('express-session');
var passport = require('passport');
var bcrypt = require('bcryptjs');

router.use(csrf());

router.get('/home', isLoggedIn, function(req, res){
  res.render('user/home');

});

router.get('/vote', isLoggedIn, function(req, res){
  res.render('user/vote', {csrfToken: req.csrfToken()});
});

router.post('/polled', isLoggedIn, function(req,res){

  var arr = [];
  for (i in req.body.opts){
    arr.push({"name": req.body.opts[i], votes: 0});
  }
  // console.log(arr);

  var title = req.body.title.replace(/\s/g, "-");
  var marks = title.replace("?", "%3F")
  var marked =req.body.title.replace("?", "%3F");

  var item = {
    user: req.user,
    title: req.body.title,
    url: "localhost:3000/user/polled/"+ marks,
    url2: "/user/results/" + marked,
    options: req.body.opts,
    voted: arr,
    total: 0
  }
  console.log(item.user);
  var poll = new Vote(item);
  poll.save();
  poll.user = req.user._id;
  res.render('user/url', { poll: poll});
});

router.get('/about', isLoggedIn, function(req, res){
  res.render('user/about');
});
router.get('/pollList', isLoggedIn, function(req, res){
  Vote.find({"user": req.user}).then(function(doc){
  res.render('user/pollList', {poll: doc});
  });

});



router.get('/polled/:title', function(req, res){
  var title = req.params.title.replace(/-/g, " ");
  console.log(title);
  Vote.find({title: title}).then(function(doc){


    res.render('user/polled', {data: doc});
  });
});

router.use(function(req,res,next){
  console.log('Looking for URL: ' + req.url);
  next();
});

router.use(function(err, req, res, next){
  console.log('Error: ' + err.message);
  next();
});

router.post('/voted', function(req, res){

  var choose = req.body.chosen
  var title = req.body.titles
  console.log('title: ', choose);
  Vote
    .update({"title":  req.body.titles, "voted.name": req.body.chosen},  { "$inc": { "voted.$.votes": 1, "total": 1  } },{ upsert: true }).then(function(result){

      console.log(result);
    res.redirect(303, 'voterresults/'+ title.replace('?', '%3F'));

  });

});


router.get('/results', isLoggedIn, function(req, res){
  var total_votes = [];
  Vote.find({"user": req.user}).then(function(doc){
    // console.log(JSON.stringify(doc));

    res.render('user/results', {poll: doc});
  });


});

router.get('/results/:title', isLoggedIn, function(req, res){
  var title = req.params.title;
  Vote.find({"title":title}).then(function(doc){
    console.log(JSON.stringify(doc));
    res.render('user/results', {poll: doc});
  });

});
router.get('/voterresults/:title', function(req, res){
  var title = req.params.title;
  Vote.find({"title":title}).then(function(doc){
    console.log(JSON.stringify(doc));
    res.render('user/voterresults', {poll: doc, title: 'Vote Results', layout: 'pre'});
  });

});



router.delete('/polled/:item', isLoggedIn, function(req,res){
  Vote.find({title: req.params.item.replace(/\-/g, " ")}).remove(function(err,data){
    if (err) throw err;
    console.log(JSON.stringify(data));
    res.json(data);
  });
});

router.get('/logout', isLoggedIn, function(req, res, next){
  req.logout();
  res.redirect('/');
});


router.use('/', notLoggedIn, function(req, res, next){
  next();
});

router.get('/register', function(req, res){
  var messages = req.flash('error');
  res.render('user/register', { title: 'register', layout: 'pre',  csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/register', passport.authenticate('local.signup', {
  successRedirect: '/user/home',
  failureRedirect: '/user/register',
  failureFlash: true
}));

router.get('/login', function(req, res){
  var messages = req.flash('error');
  res.render('user/login', {csrfToken: req.csrfToken(), title: 'login', layout: 'pre', messages: messages, hasErrors: messages.length > 0 });

});

router.post('/login', passport.authenticate('local.signin', {
  successRedirect: '/user/home',
  failureRedirect: '/user/login',
  failureFlash: true
}));





module.exports = router;
function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
  res.redirect('/');
}


function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
  return next();
  }
  res.redirect('/');
}
