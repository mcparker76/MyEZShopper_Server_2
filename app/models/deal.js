var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DealSchema = new Schema({
    name: String,
    price: Number,
    storeName : String,
    location : String,
    expirationDate : Date,
    description : String,
    category : String,
    likeCount : Number,
    dislikeCount : Number,
    likes : [],
    dislikes : []
});

module.exports = mongoose.model('Deal', DealSchema);