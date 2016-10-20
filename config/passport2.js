var passport = require('passport');
var User2 = require('../models/user2');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User2.findById(id, function(err, user){
    done(err, user);
  });
});

passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty().isLength({min: 6});
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User2.findOne({'email': email}, function(err, user){
    if (err){
      return done(err);
    }
    if (user){
      return done(null, false, {message: 'Email is already in use.'});
    }
    var newUser2 = new User2();
    newUser2.email = email;
    newUser2.password = newUser2.encryptPassword(password);
    newUser2.save(function(err, result){
      if (err) {
        return done(err)
      }
      return done(null, newUser2);
    });
  });
}));

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){
  req.checkBody('email', 'Invalid email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid password').notEmpty();
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User2.findOne({'email': email}, function(err, user){
    if (err){
      return done(err);
    }
    if (!user){
      return done(null, false, {message: 'No user found.'});
    }
    if (!user.validPassword(password)) {
      return done(null, false, {message: 'Wrong password.'});
    }

      return done(null, user);

  });
}));