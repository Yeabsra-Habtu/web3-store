/**
 * Web3Controller.js
 * This controller handles all Web3 and blockchain interactions for the application
 */

const Web3Service = require("../services/Web3Service");
const CustomerWallet = require("../models/CustomerWallet");
const CryptoPayment = require("../models/CryptoPayment");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

const Web3Controller = {};

/**
 * Initialize the Web3 service
 */
Web3Controller.initialize = async (req, res) => {
  try {
    const success = await Web3Service.initialize();
    if (success) {
      req.flash("success", "Web3 service initialized successfully");
    } else {
      req.flash("error", "Failed to initialize Web3 service");
    }
    return res.redirect("/dashboard");
  } catch (error) {
    req.flash("error", `Error initializing Web3 service: ${error.message}`);
    return res.redirect("/dashboard");
  }
};

/**
 * Connect a customer's wallet
 */
Web3Controller.connectWallet = async (req, res) => {
  const { customerId, walletAddress, walletType } = req.body;

  try {
    // Validate wallet address format
    if (
      !walletAddress ||
      walletAddress.length !== 42 ||
      !walletAddress.startsWith("0x")
    ) {
      req.flash("error", "Invalid Ethereum wallet address");
      return res.redirect("/customers");
    }

    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      req.flash("error", "Customer not found");
      return res.redirect("/customers");
    }

    // Check if wallet already exists for this customer
    let customerWallet = await CustomerWallet.findOne({ customer: customerId });

    if (customerWallet) {
      // Update existing wallet
      customerWallet.walletAddress = walletAddress;
      customerWallet.walletType = walletType || "ethereum";
      customerWallet.updatedAt = new Date();
      await customerWallet.save();

      req.flash("success", `Wallet updated for customer ${customer.name}`);
    } else {
      // Create new wallet
      customerWallet = new CustomerWallet({
        customer: customerId,
        walletAddress,
        walletType: walletType || "ethereum",
      });
      await customerWallet.save();

      req.flash("success", `Wallet connected for customer ${customer.name}`);
    }

    return res.redirect("/customers");
  } catch (error) {
    req.flash("error", `Error connecting wallet: ${error.message}`);
    return res.redirect("/customers");
  }
};

/**
 * Process a cryptocurrency payment
 */
Web3Controller.processCryptoPayment = async (req, res) => {
  const { saleId, walletAddress, amount, currency } = req.body;

  try {
    // Find the sale
    const sale = await Sale.findById(saleId).populate("customer");
    if (!sale) {
      req.flash("error", "Sale not found");
      return res.redirect("/sales");
    }

    // Create a crypto payment record
    const exchangeRate = 2000; // Mock exchange rate (ETH/USD) - In production, use an API
    const amountInFiat = amount * exchangeRate;

    const cryptoPayment = new CryptoPayment({
      sale: saleId,
      customer: sale.customer._id,
      walletAddress,
      currency: currency || "ETH",
      amount,
      amountInFiat,
      exchangeRate,
      status: "pending",
    });

    await cryptoPayment.save();

    // In a real application, you would initiate the blockchain transaction here
    // For demo purposes, we'll simulate a successful transaction
    cryptoPayment.transactionHash =
      "0x" + Math.random().toString(16).substring(2, 42);
    cryptoPayment.status = "completed";
    cryptoPayment.confirmations = 1;
    await cryptoPayment.save();

    // Update the sale with the payment
    sale.paid += amountInFiat;
    await sale.save();

    req.flash(
      "success",
      `Cryptocurrency payment of ${amount} ${currency} processed successfully`
    );
    return res.redirect("/sales");
  } catch (error) {
    req.flash(
      "error",
      `Error processing cryptocurrency payment: ${error.message}`
    );
    return res.redirect("/sales");
  }
};

/**
 * Generate an NFT receipt for a sale
 */
Web3Controller.generateNFTReceipt = async (req, res) => {
  const { saleId } = req.params;

  try {
    // Find the sale
    const sale = await Sale.findById(saleId)
      .populate("customer")
      .populate("product");

    if (!sale) {
      req.flash("error", "Sale not found");
      return res.redirect("/sales");
    }

    // Find the customer's wallet
    const customerWallet = await CustomerWallet.findOne({
      customer: sale.customer._id,
    });

    if (!customerWallet) {
      req.flash("error", "Customer does not have a connected wallet");
      return res.redirect("/sales");
    }

    // Check if NFT receipt already exists
    const existingNFT = customerWallet.nftReceipts.find(
      (receipt) => receipt.saleId.toString() === saleId
    );

    if (existingNFT) {
      req.flash(
        "success",
        `NFT receipt already generated with token ID ${existingNFT.tokenId}`
      );
      return res.redirect("/sales");
    }

    // Prepare sale data for the NFT
    const saleData = {
      amount: sale.amount,
      productName: sale.product ? sale.product.name : "Unknown Product",
      date: sale.salesDate,
      customerName: sale.customer.name,
    };

    // In a real application, you would call the blockchain to mint the NFT
    // For demo purposes, we'll simulate a successful minting
    const tokenId = Math.floor(Math.random() * 1000000);
    const transactionHash = "0x" + Math.random().toString(16).substring(2, 42);

    // Add the NFT receipt to the customer's wallet
    customerWallet.nftReceipts.push({
      tokenId: tokenId.toString(),
      saleId: sale._id,
      transactionHash,
      createdAt: new Date(),
    });

    await customerWallet.save();

    req.flash("success", `NFT receipt generated with token ID ${tokenId}`);
    return res.redirect("/sales");
  } catch (error) {
    req.flash("error", `Error generating NFT receipt: ${error.message}`);
    return res.redirect("/sales");
  }
};

/**
 * Issue loyalty tokens to a customer
 */
Web3Controller.issueLoyaltyTokens = async (req, res) => {
  const { customerId, amount } = req.body;

  try {
    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      req.flash("error", "Customer not found");
      return res.redirect("/customers");
    }

    // Find the customer's wallet
    const customerWallet = await CustomerWallet.findOne({
      customer: customerId,
    });

    if (!customerWallet) {
      req.flash("error", "Customer does not have a connected wallet");
      return res.redirect("/customers");
    }

    // Calculate tokens to issue (1 token per 10 currency units spent)
    const tokensToIssue = Math.floor(amount / 10);

    if (tokensToIssue <= 0) {
      req.flash("error", "Amount too small to issue tokens");
      return res.redirect("/customers");
    }

    // In a real application, you would call the blockchain to mint the tokens
    // For demo purposes, we'll simulate a successful minting
    customerWallet.loyaltyTokenBalance += tokensToIssue;
    await customerWallet.save();

    req.flash(
      "success",
      `${tokensToIssue} loyalty tokens issued to ${customer.name}`
    );
    return res.redirect("/customers");
  } catch (error) {
    req.flash("error", `Error issuing loyalty tokens: ${error.message}`);
    return res.redirect("/customers");
  }
};

/**
 * Get a customer's wallet information
 */
Web3Controller.getWalletInfo = async (req, res) => {
  const { customerId } = req.params;

  try {
    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Find the customer's wallet
    const customerWallet = await CustomerWallet.findOne({
      customer: customerId,
    });

    if (!customerWallet) {
      return res
        .status(404)
        .json({ error: "Customer does not have a connected wallet" });
    }

    // Return wallet information
    return res.json({
      walletAddress: customerWallet.walletAddress,
      walletType: customerWallet.walletType,
      loyaltyTokenBalance: customerWallet.loyaltyTokenBalance,
      nftReceipts: customerWallet.nftReceipts,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = Web3Controller;
