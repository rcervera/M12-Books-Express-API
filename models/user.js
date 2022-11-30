var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//var crypto = require('crypto');

var UserSchema = new Schema({ 
  fullname: { type: String, required: true },
  role: [{
    type: String,
    enum: [
      "member","librarian","lender","administrator"     
    ],
    default: "member"
  }],
  email: { type: String, required: true },
  password: { type: String, required: true },  
});



// Export model
module.exports = mongoose.model('User', UserSchema);

