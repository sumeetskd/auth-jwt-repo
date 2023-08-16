const mongoose = require('mongoose');
let userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    address: String,
    password: String
})
//users is the name of the collection which will use this perticualr model
module.exports = mongoose.model('users', userSchema);