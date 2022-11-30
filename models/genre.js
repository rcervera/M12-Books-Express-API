var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

var Schema = mongoose.Schema;

var GenreSchema = new Schema({
  name: { type: String, required: true, 
          minLength: 1, 
          maxLength: 50 },
});

GenreSchema.plugin(mongoosePaginate);
// Export model.
module.exports = mongoose.model("Genre", GenreSchema);
