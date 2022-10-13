var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PublisherSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});


// Export model.
module.exports = mongoose.model("Publisher", PublisherSchema);
