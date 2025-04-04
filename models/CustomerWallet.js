const mongoose = require("mongoose");
const tz = require("mongoose-timezone");

/**
 * CustomerWallet Schema
 * Stores blockchain wallet information associated with customers
 */
const customerWalletSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
    unique: true,
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  walletType: {
    type: String,
    enum: ["ethereum", "bitcoin", "other"],
    default: "ethereum",
  },
  loyaltyTokenBalance: {
    type: Number,
    default: 0,
  },
  nftReceipts: [
    {
      tokenId: {
        type: String,
      },
      saleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
      },
      transactionHash: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

customerWalletSchema.plugin(tz);
module.exports = mongoose.model("CustomerWallet", customerWalletSchema);
