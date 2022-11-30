var mongoose = require("mongoose");
const { DateTime } = require("luxon"); //per treballar amb dates


var Schema = mongoose.Schema;

var BookInstanceSchema = new Schema(
 {
  book: { type: Schema.ObjectId, ref: "TechnicalBook", required: true }, // Reference to the associated book.
  imprintYear: { type: Number, required: false },
  room:  { type: String, required: false },
  rack:  { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ["Available", "No available", "Maintenance","Reserved","Lended","Lost"],
    default: "Available",
    },
  
  },
  { timestamps: true },
  );


BookInstanceSchema.virtual("createdAt_formatted").get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});

BookInstanceSchema.virtual("createdAt_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.createdAt).toISODate(); //format 'YYYY-MM-DD'
});

// Export model.
module.exports = mongoose.model("BookInstance", BookInstanceSchema);
