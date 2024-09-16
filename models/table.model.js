const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const TableModel = mongoose.model("Table", TableSchema);
module.exports = TableModel;
