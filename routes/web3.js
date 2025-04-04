/**
 * Web3 Routes
 * Routes for Web3 functionality including wallet connections, crypto payments, and NFT receipts
 */

const router = require("express").Router();
const Web3Controller = require("../controllers/Web3Controller");
const PermissionHandler = require("../middlewares/PermissionHandler");

// Initialize Web3 service
router.get(
  "/initialize",
  PermissionHandler(["admin"]),
  Web3Controller.initialize
);

// Wallet routes
router.post(
  "/wallet/connect",
  PermissionHandler(["admin", "sales"]),
  Web3Controller.connectWallet
);
router.get(
  "/wallet/:customerId",
  PermissionHandler(["admin", "sales"]),
  Web3Controller.getWalletInfo
);

// Crypto payment routes
router.post(
  "/payment/crypto",
  PermissionHandler(["admin", "sales"]),
  Web3Controller.processCryptoPayment
);

// NFT receipt routes
router.get(
  "/nft/generate/:saleId",
  PermissionHandler(["admin", "sales"]),
  Web3Controller.generateNFTReceipt
);

// Loyalty token routes
router.post(
  "/loyalty/issue",
  PermissionHandler(["admin", "sales"]),
  Web3Controller.issueLoyaltyTokens
);

module.exports = router;
