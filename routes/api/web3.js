/**
 * Web3 API Routes
 * API endpoints for Web3 functionality
 */

const router = require("express").Router();
const Web3Controller = require("../../controllers/Web3Controller");

// Get wallet information
router.get("/wallet/:customerId", Web3Controller.getWalletInfo);

// Process crypto payment
router.post("/payment/crypto", Web3Controller.processCryptoPayment);

// Generate NFT receipt
router.post("/nft/generate/:saleId", Web3Controller.generateNFTReceipt);

// Issue loyalty tokens
router.post("/loyalty/issue", Web3Controller.issueLoyaltyTokens);

module.exports = router;
