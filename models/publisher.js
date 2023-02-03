var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


var Schema = mongoose.Schema;

var PublisherSchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 100 },
});

PublisherSchema.plugin(mongoosePaginate);
// Export model.
module.exports = mongoose.model("Publisher", PublisherSchema);
