'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
      publicRepos: Number
	},
	local: {
		email: {type: String, required: true},
		password: {type: String, required: true}
	}
});

module.exports = mongoose.model('User', User);
