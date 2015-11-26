var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
const LIKE = "like";
const DISLIKE = "dislike";

app.use(morgan('dev')); // log requests to the console
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var moment = require('moment');
var cronJob = require('cron').CronJob;
var myJob = new cronJob('00 00 00 * * 0-6', function(){
	var currDate = new Date(moment().utcOffset(-300).format('MM/DD/YYYY'));
	console.log("CURR DATE: " + currDate.getTime());
	console.log("Month: " + (currDate.getMonth()+1));
	console.log("Day: " + currDate.getDate());
	console.log("Year: " + currDate.getFullYear());

	Deal.find({expirationDate: {$lt:currDate}}).remove().exec();
	/*
	 deal.remove({expirationDate:expDate}, function(err){
		if (err){ return handleError(err);console.log("ERROR");}
	});*/
});
myJob.start();


var port     = process.env.PORT || 8080;
var mongoose   = require('mongoose');
mongoose.connect('localhost:27017/MyEZShopper');
var User = require('./app/models/user');
var Deal = require('./app/models/deal');

// ROUTES FOR API
// =============================================================================
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to MyEZShopper api!' });
});

// on routes that end in /user
// ----------------------------
router.route('/user')
	// create a user
	.post(function(req, res) {

		User.find({email:req.body.email}, function(err, user) {
			if (err)
				res.send(err);
			else if (user.length > 0){
				res.send(403)
			}else{
				var user = new User();
				user.name = req.body.name;
				user.password = req.body.password;
				user.email = req.body.email;
				user.list = req.body.list;//todo can this be removed???????????
				user.save(function(err, user) {
					if (err){
						res.send(err);
					}
					else{
						res.json(user);
					}
				});
			}
		});
	})

	// get all the users
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err)
				res.send(err);
			res.json(users);
		});
	});

// on routes that end in /user/:user_id
// -------------------------------------
router.route('/user/:user_id')
	// get the user with that id
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err)
				res.send(err);
			res.json(user);
		});
	})

	// update the user with this id
	.put(function(req, res) {
		User.findByIdAndUpdate(req.params.user_id, req.body, function(err, user) {
			console.log(req.body);
			if (err) {
				console.log("ERROR");
				res.send(err);
			}else{
				res.json({message:'User updated'});
			}
		});
	})

	// delete the user with this id
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err)
				res.send(err);
			res.json({ message: 'Successfully deleted' });
		});
	});

// on routes that end in /users/login
// ----------------------------
router.route('/user/login')
	// create a user and login attempt
	.post(function(req, res) {
		User.find({email:req.body.email, password:req.body.password}, function(err, user){
			if (err){
				res.send(400);
			}
			else if (user.length == 0){
				res.send(400);
			}else{
				console.log("ID "+ user);
				res.json(user);
			}
		});
	})


////////////////////////////////////////////////////////////////////////////////
//                     DEAL ROUTES
///////////////////////////////////////////////////////////////////////////////


// on routes that end in /deal
// ----------------------------
router.route('/deal')
	// add a deal
	.post(function(req, res) {
		var deal = new Deal();
		deal.name = req.body.name;
		deal.price = req.body.price;
		deal.storeName = req.body.storeName;
		deal.location = req.body.location;
		deal.expirationDate = req.body.expirationDate;
		deal.category = req.body.category;
		deal.description = req.body.description;

		deal.save(function(err) {
			if (err)
				res.send(err);
			res.json({ message: 'Deal Added!' });
		});
	})

	// get all the deals
	.get(function(req, res) {
		Deal.find(function(err, deals) {
			if (err)
				res.send(err);
			res.json(deals);
		});
	});

// on routes that end in /deal/search/name/:query
// ----------------------------
router.route('/deal/search/name/:query_value')
	// search for a deal
	.get(function(req, res){
		var tokens = req.params.query_value.split('+');
		var qv = "";
		for (index in tokens){
			qv += tokens[index] + ' ';
		}
		//trim off last space
		qv = qv.substring(0, qv.length - 1);

		Deal.find({name:qv}, function(err, deals){
			if (err){
				console.log("ERROR");
				res.send(400);
			}
			else if (deals.length == 0){
				console.log("NO DEALS");
				res.send(404);
			}else{
				res.json(deals);
			}
		});
	});

// on routes that end in /deal/search/location/:query
// ----------------------------
router.route('/deal/search/location/:query_value')
	// search for a deal
	.get(function(req, res){
		var tokens = req.params.query_value.split('+');
		var qv = "";
		for (index in tokens){
			qv += tokens[index] + ' ';
		}
		//trim off last space
		qv = qv.substring(0, qv.length - 1);

		Deal.find({location:qv}, function(err, deals){
			if (err){
				console.log("ERROR");
				res.send(400);
			}
			else if (deals.length == 0){
				console.log("NO DEALS");
				res.send(404);
			}else{
				res.json(deals);
			}
		});
	});

// on routes that end in /deal/search/storename/:query
// ----------------------------
router.route('/deal/search/storename/:query_value')
	// search for a deal
	.get(function(req, res){
		var tokens = req.params.query_value.split('+');
		var qv = "";
		for (index in tokens){
			qv += tokens[index] + ' ';
		}
		//trim off last space
		qv = qv.substring(0, qv.length - 1);

		Deal.find({storeName:qv}, function(err, deals){
			if (err){
				console.log("ERROR");
				res.send(400);
			}
			else if (deals.length == 0){
				console.log("NO DEALS");
				res.send(404);
			}else{
				res.json(deals);
			}
		});
	});

// on routes that end in /deal/search/category/:query
// ----------------------------
router.route('/deal/search/category/:query_value')
	// search for a deal
	.get(function(req, res){
		var tokens = req.params.query_value.split('+');
		var qv = "";
		for (index in tokens){
			qv += tokens[index] + ' ';
		}
		//trim off last space
		qv = qv.substring(0, qv.length - 1);

		Deal.find({category:qv}, function(err, deals){
			if (err){
				console.log("ERROR");
				res.send(400);
			}
			else if (deals.length == 0){
				console.log("NO DEALS");
				res.send(404);
			}else{
				res.json(deals);
			}
		});
	});

// on routes that end in /deal/:deal_id
// -------------------------------------
router.route('/deal/:deal_id')
	// get the deal with that id
	.get(function(req, res) {
		Deal.findById(req.params.deal_id, function(err, deal) {
			if (err)
				res.send(err);
			res.json(deal);
		});
	})

	// update the deal with this id
	.put(function(req, res) {
		Deal.findByIdAndUpdate(req.params.deal_id, req.body, function(err, deal) {
			console.log(req.body);
			if (err) {
				console.log("ERROR");
				res.send(err);
			}else{
				res.json({message:'Deal updated'});
			}
		});
	})

	// delete the deal with this id
	.delete(function(req, res) {
		Deal.remove({_id: req.params.deal_id}, function(err, deal) {
			if (err)
				res.send(err);
			res.json({ message: 'Successfully deleted' });
		});
	});

// on routes that end in /deal/like/:deal_id
// -------------------------------------
router.route('/deal/like/:deal_id')
	// update the deal with this id
	.put(function(req, res) {

		var dealId = req.params.deal_id;
		var type = req.body.type;
		var user = {};
		user["userId"] = req.body.userId;

		if (type == LIKE){
			Deal.count({_id: dealId, likes: user}, function(err, count){
				if (count > 0){
					res.json({message:"You already like this"});
				}else{
					//do you already dislike it?
					Deal.count({_id: dealId, dislikes: user}, function(err, count){
						if (count > 0){
							//CHANGE FROM DISLIKE TO LIKE
							Deal.findByIdAndUpdate(dealId, {$push : {likes : user}, "$inc":{likeCount:1, dislikeCount:-1}, $pull : {dislikes:user}}, function(err, deal) {
								if (err) {
									res.send(err);
								}else{
									res.json({message:'changed to like'});
								}
							});
						}else{
							//SET LIKE FOR FIRST TIME
							Deal.findByIdAndUpdate(dealId, {$push : {likes : user}, $inc:{likeCount:1}}, function(err, deal) {
								if (err) {
									res.send(err);
								}else{
									res.json({message:'like updated'});
								}
							});
						}
					});
				}
			});
		}else if (type == DISLIKE){
			Deal.count({_id: dealId, dislikes: user}, function(err, count){
				if (count > 0){
					res.json({message:"You already dislike this"});
				}else{
					//do you already like it?
					Deal.count({_id: dealId, likes: user}, function(err, count){
						if (count > 0){
							//CHANGE FROM LIKE TO DISLIKE
							Deal.findByIdAndUpdate(dealId, {$push : {dislikes : user}, "$inc":{dislikeCount:1, likeCount:-1}, $pull : {likes:user}}, function(err, deal) {
								if (err) {
									res.send(err);
								}else{
									res.json({message:'changed to dislike'});
								}
							});
						}else{
							//SET DISLIKE FOR FIRST TIME
							Deal.findByIdAndUpdate(dealId, {$push : {dislikes : user}, $inc:{dislikeCount:1}}, function(err, deal) {
								if (err) {
									res.send(err);
								}else{
									res.json({message:'Dislike updated'});
								}
							});
						}
					});
				}
			});
		}

	});

// REGISTER ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);