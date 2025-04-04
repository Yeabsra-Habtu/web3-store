const mongoose = require("mongoose");
const tz = require("mongoose-timezone");

/**
 * CryptoPayment Schema
 * Stores cryptocurrency payment information for sales
 */
const cryptoPaymentSchema = new mongoose.Schema({
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale",
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    enum: ["ETH", "BTC", "USDT", "USDC", "OTHER"],
    default: "ETH",
  },
  amount: {
    type: Number,
    required: true,
  },
  amountInFiat: {
    type: Number,
    required: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
  },
  transactionHash: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  confirmations: {
    type: Number,
    default: 0,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cryptoPaymentSchema.plugin(tz);
module.exports = mongoose.model("CryptoPayment", cryptoPaymentSchema);
