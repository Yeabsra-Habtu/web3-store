/**
 * Web3Service.js
 * This service handles all Web3 and blockchain interactions for the application
 */

const Web3 = require("web3");
const ethers = require("ethers");

// Smart contract ABI for NFT receipts
const NFT_RECEIPT_ABI = [
  // Basic ERC-721 functions
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// Smart contract ABI for loyalty tokens
const LOYALTY_TOKEN_ABI = [
  // Basic ERC-20 functions
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

class Web3Service {
  constructor() {
    // Initialize with default provider (can be changed later)
    this.provider = null;
    this.web3 = null;
    this.signer = null;
    this.nftReceiptContract = null;
    this.loyaltyTokenContract = null;
    this.initialized = false;

    // Contract addresses (to be set in environment variables or config)
    this.NFT_RECEIPT_CONTRACT_ADDRESS =
      process.env.NFT_RECEIPT_CONTRACT_ADDRESS || "";
    this.LOYALTY_TOKEN_CONTRACT_ADDRESS =
      process.env.LOYALTY_TOKEN_CONTRACT_ADDRESS || "";
  }

  /**
   * Initialize the Web3 service with a provider
   * @param {string} providerUrl - The URL of the Web3 provider (e.g., Infura, Alchemy)
   * @returns {boolean} - Whether initialization was successful
   */
  async initialize(
    providerUrl = "https://sepolia.infura.io/v3/f07XfBC84nlN6aDv04u34yzQVtrf1o8oSbPyjBqvyJDAKzdTH+3W/w"
  ) {
    try {
      // Initialize Web3 with the provider
      this.web3 = new Web3(providerUrl);

      // Initialize ethers provider
      this.provider = new ethers.providers.JsonRpcProvider(providerUrl);

      // Initialize contracts if addresses are available
      if (this.NFT_RECEIPT_CONTRACT_ADDRESS) {
        this.nftReceiptContract = new ethers.Contract(
          this.NFT_RECEIPT_CONTRACT_ADDRESS,
          NFT_RECEIPT_ABI,
          this.provider
        );
      }

      if (this.LOYALTY_TOKEN_CONTRACT_ADDRESS) {
        this.loyaltyTokenContract = new ethers.Contract(
          this.LOYALTY_TOKEN_CONTRACT_ADDRESS,
          LOYALTY_TOKEN_ABI,
          this.provider
        );
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize Web3 service:", error);
      return false;
    }
  }

  /**
   * Set a wallet signer for transactions
   * @param {string} privateKey - The private key of the wallet
   */
  setSigner(privateKey) {
    if (!this.provider) {
      throw new Error("Provider not initialized. Call initialize() first.");
    }

    const wallet = new ethers.Wallet(privateKey, this.provider);
    this.signer = wallet;

    // Update contracts with signer
    if (this.nftReceiptContract) {
      this.nftReceiptContract = this.nftReceiptContract.connect(wallet);
    }

    if (this.loyaltyTokenContract) {
      this.loyaltyTokenContract = this.loyaltyTokenContract.connect(wallet);
    }
  }

  /**
   * Connect to a wallet using browser provider (MetaMask, etc.)
   * @returns {string} - The connected wallet address
   */
  async connectWallet() {
    try {
      // Check if window.ethereum is available (MetaMask or other wallet)
      if (typeof window !== "undefined" && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        // Use the first account
        const address = accounts[0];

        // Create Web3 instance with the browser provider
        this.web3 = new Web3(window.ethereum);

        // Create ethers provider with the browser provider
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();

        // Update contracts with signer
        if (this.nftReceiptContract) {
          this.nftReceiptContract = this.nftReceiptContract.connect(
            this.signer
          );
        }

        if (this.loyaltyTokenContract) {
          this.loyaltyTokenContract = this.loyaltyTokenContract.connect(
            this.signer
          );
        }

        return address;
      } else {
        throw new Error(
          "No Ethereum provider found. Please install MetaMask or another wallet."
        );
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  /**
   * Get the current wallet address
   * @returns {string|null} - The current wallet address or null if not connected
   */
  async getWalletAddress() {
    try {
      if (this.signer) {
        return await this.signer.getAddress();
      } else if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        return accounts[0] || null;
      }
      return null;
    } catch (error) {
      console.error("Failed to get wallet address:", error);
      return null;
    }
  }

  /**
   * Create an NFT receipt for a sale
   * @param {string} saleId - The ID of the sale
   * @param {string} customerAddress - The customer's Ethereum address
   * @param {object} saleData - The sale data to include in the NFT metadata
   * @returns {object} - The transaction receipt
   */
  async createNFTReceipt(saleId, customerAddress, saleData) {
    if (!this.initialized || !this.nftReceiptContract) {
      throw new Error(
        "Web3 service not properly initialized or NFT contract not set"
      );
    }

    if (!this.signer) {
      throw new Error(
        "No signer set. Call setSigner() or connectWallet() first."
      );
    }

    try {
      // Generate a unique token ID based on the sale ID
      const tokenId =
        this.web3.utils.hexToNumber(this.web3.utils.keccak256(saleId)) %
        10000000000; // Limit to a reasonable number

      // Create metadata for the NFT
      const metadata = {
        name: `W3bStore Receipt #${saleId}`,
        description: "Digital receipt for a purchase at W3bStore",
        image: "https://w3bstore.com/receipt-image.png", // Placeholder
        attributes: [
          {
            trait_type: "Sale ID",
            value: saleId,
          },
          {
            trait_type: "Date",
            value: new Date().toISOString(),
          },
          {
            trait_type: "Amount",
            value: saleData.amount.toString(),
          },
          {
            trait_type: "Product",
            value: saleData.productName,
          },
        ],
      };

      // In a real implementation, you would upload this metadata to IPFS
      // and use the resulting URL as the tokenURI

      // For now, we'll just mint the token
      const tx = await this.nftReceiptContract.mint(customerAddress, tokenId);
      const receipt = await tx.wait();

      return {
        success: true,
        tokenId,
        transactionHash: receipt.transactionHash,
        metadata,
      };
    } catch (error) {
      console.error("Failed to create NFT receipt:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Issue loyalty tokens to a customer based on purchase amount
   * @param {string} customerAddress - The customer's Ethereum address
   * @param {number} purchaseAmount - The purchase amount in fiat currency
   * @returns {object} - The transaction receipt
   */
  async issueLoyaltyTokens(customerAddress, purchaseAmount) {
    if (!this.initialized || !this.loyaltyTokenContract) {
      throw new Error(
        "Web3 service not properly initialized or loyalty token contract not set"
      );
    }

    if (!this.signer) {
      throw new Error(
        "No signer set. Call setSigner() or connectWallet() first."
      );
    }

    try {
      // Calculate tokens to issue (1 token per 10 currency units spent)
      const tokensToIssue = Math.floor(purchaseAmount / 10);

      if (tokensToIssue <= 0) {
        return {
          success: true,
          tokensIssued: 0,
          message: "Purchase amount too small to issue tokens",
        };
      }

      // Convert to wei (assuming 18 decimals for the token)
      const tokenAmount = ethers.utils.parseUnits(tokensToIssue.toString(), 18);

      // Mint tokens to the customer
      const tx = await this.loyaltyTokenContract.mint(
        customerAddress,
        tokenAmount
      );
      const receipt = await tx.wait();

      return {
        success: true,
        tokensIssued: tokensToIssue,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      console.error("Failed to issue loyalty tokens:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get a customer's loyalty token balance
   * @param {string} customerAddress - The customer's Ethereum address
   * @returns {string} - The token balance as a string
   */
  async getLoyaltyTokenBalance(customerAddress) {
    if (!this.initialized || !this.loyaltyTokenContract) {
      throw new Error(
        "Web3 service not properly initialized or loyalty token contract not set"
      );
    }

    try {
      const balance = await this.loyaltyTokenContract.balanceOf(
        customerAddress
      );
      return ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals
    } catch (error) {
      console.error("Failed to get loyalty token balance:", error);
      return "0";
    }
  }

  /**
   * Process a cryptocurrency payment
   * @param {string} fromAddress - The customer's address
   * @param {string} toAddress - The store's address
   * @param {number} amount - The amount in Ether
   * @returns {object} - The transaction receipt
   */
  async processCryptoPayment(fromAddress, toAddress, amount) {
    if (!this.initialized) {
      throw new Error("Web3 service not properly initialized");
    }

    try {
      // Convert amount to wei
      const weiAmount = ethers.utils.parseEther(amount.toString());

      // Create transaction object
      const tx = {
        from: fromAddress,
        to: toAddress,
        value: weiAmount,
        gasLimit: ethers.utils.hexlify(21000), // Standard gas limit for ETH transfers
        gasPrice: await this.provider.getGasPrice(),
      };

      // Send transaction
      const transaction = await this.signer.sendTransaction(tx);
      const receipt = await transaction.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error("Failed to process crypto payment:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify if a transaction has been confirmed
   * @param {string} txHash - The transaction hash
   * @param {number} confirmations - The number of confirmations required
   * @returns {boolean} - Whether the transaction has been confirmed
   */
  async verifyTransaction(txHash, confirmations = 1) {
    if (!this.initialized) {
      throw new Error("Web3 service not properly initialized");
    }

    try {
      const tx = await this.provider.getTransaction(txHash);

      if (!tx) {
        return false;
      }

      // If tx.blockNumber is null, the transaction is still pending
      if (!tx.blockNumber) {
        return false;
      }

      const currentBlock = await this.provider.getBlockNumber();
      const confirmationBlocks = currentBlock - tx.blockNumber + 1;

      return confirmationBlocks >= confirmations;
    } catch (error) {
      console.error("Failed to verify transaction:", error);
      return false;
    }
  }
}

module.exports = new Web3Service();
