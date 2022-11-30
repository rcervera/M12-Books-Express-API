var mongoose = require("mongoose");
const { DateTime } = require("luxon"); //per treballar amb dates


var Schema = mongoose.Schema;

var BookLendingSchema = new Schema(
 {
  bookinstance: { type: Schema.ObjectId, ref: "BookInstance", required: true }, // Reference to the associated book.
  member: { type: Schema.ObjectId, ref: "User", required: true }, // Reference to the associated user.
  createDate: {type: Date, required: false} , 
  dueDate: {type: Date, required: false} , 
  returnDate: {type: Date, required: false} , 
  }
  );


BookLendingSchema.virtual("dueDate_formatted").get(function () {
  return DateTime.fromJSDate(this.dueDate).toLocaleString(DateTime.DATE_MED);
});

BookLendingSchema.virtual("dueDate_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.dueDate).toISODate(); //format 'YYYY-MM-DD'
});

BookLendingSchema.virtual("returnDate_formatted").get(function () {
  return DateTime.fromJSDate(this.returnDate).toLocaleString(DateTime.DATE_MED);
});

BookLendingSchema.virtual("returnDate_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.returnDate).toISODate(); //format 'YYYY-MM-DD'
});


BookLendingSchema.virtual("isDelayed").get(function () {  
  if (Date.now() >= this.dueDate.getTime()) return true;
  return false;
 });

// Export model.
module.exports = mongoose.model("BookLending", BookLendingSchema);
