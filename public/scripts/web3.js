/**
 * web3.js
 * Client-side JavaScript for Web3 functionality
 */

// Initialize Web3 functionality when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded - Web3 script initialized");
  // Check if Web3 is available
  if (typeof window.ethereum !== "undefined") {
    console.log("MetaMask is installed!");
    initializeWeb3Buttons();
  } else {
    console.log(
      "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
    );
  }
});

/**
 * Initialize Web3 buttons and event listeners
 */
function initializeWeb3Buttons() {
  // Connect wallet button
  const connectWalletButtons = document.querySelectorAll(".connect-wallet-btn");
  connectWalletButtons.forEach((button) => {
    button.addEventListener("click", connectWallet);
  });

  // Set up customer ID for wallet connection
  const connectWalletLinks = document.querySelectorAll(".connect-wallet-link");
  connectWalletLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const customerId = this.getAttribute("data-customer-id");
      document.getElementById("wallet-customer-id").value = customerId;
    });
  });

  // Set up customer ID and name for loyalty tokens
  const loyaltyTokenLinks = document.querySelectorAll(".loyalty-token-link");
  console.log("Found loyalty token links:", loyaltyTokenLinks.length);
  loyaltyTokenLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const customerId = this.getAttribute("data-customer-id");
      const customerName = this.getAttribute("data-customer-name");
      console.log("Loyalty Token Link Clicked with Customer Data:", {
        customerId: customerId,
        customerName: customerName,
      });

      // Set the values in the form
      document.getElementById("loyalty-customer-id").value = customerId;
      document.getElementById("loyalty-customer-name").value = customerName;

      // Add visible debugging - create or update a debug element in the modal
      const debugElement = document.createElement("div");
      debugElement.className = "alert alert-info mt-3";
      debugElement.id = "loyalty-debug-info";
      debugElement.innerHTML = `<strong>Debug Info:</strong><br>Customer ID: ${customerId}<br>Customer Name: ${customerName}`;

      // Wait for the modal to be shown, then add the debug element
      setTimeout(() => {
        const modalBody = document.querySelector(
          "#issueLoyaltyTokens .modal-body"
        );
        // Remove any existing debug element
        const existingDebug = document.getElementById("loyalty-debug-info");
        if (existingDebug) {
          existingDebug.remove();
        }
        // Add the new debug element before the form
        if (modalBody) {
          const form = modalBody.querySelector("form");
          if (form) {
            modalBody.insertBefore(debugElement, form);
          } else {
            modalBody.appendChild(debugElement);
          }
        }
      }, 300); // Short delay to ensure modal is visible
    });
  });

  // Add event listener for when the loyalty token modal is shown
  console.log(
    "Setting up modal event listener, jQuery available:",
    typeof $ !== "undefined"
  );
  if (typeof $ !== "undefined") {
    $("#issueLoyaltyTokens").on("shown.bs.modal", function () {
      console.log("Modal shown event triggered");
      const customerId = document.getElementById("loyalty-customer-id").value;
      const customerName = document.getElementById(
        "loyalty-customer-name"
      ).value;
      console.log("Loyalty Token Modal Loaded with Customer Data:", {
        customerId: customerId,
        customerName: customerName,
      });
    });
  } else {
    console.error("jQuery is not available - modal events won't work");
  }
  // Set up sale ID for crypto payment
  const cryptoPaymentLinks = document.querySelectorAll(".crypto-payment-link");
  cryptoPaymentLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const saleId = this.getAttribute("data-sale-id");
      document.getElementById("crypto-sale-id").value = saleId;
    });
  });
}

/**
 * Connect to MetaMask wallet
 */
async function connectWallet() {
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    console.log("Connected to wallet:", account);

    // Update UI with connected wallet
    document.querySelectorAll(".wallet-address-input").forEach((input) => {
      input.value = account;
    });

    // Show success message
    alert("Wallet connected successfully: " + account);

    return account;
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    alert("Error connecting to wallet: " + error.message);
  }
}

/**
 * Get the current ETH to USD exchange rate
 * In a real application, this would call an API
 */
async function getExchangeRate() {
  // Mock exchange rate - in production, use an API like CoinGecko
  return 2000; // 1 ETH = $2000 USD
}

/**
 * Calculate the fiat equivalent of a crypto amount
 */
async function calculateFiatAmount(cryptoAmount, currency = "ETH") {
  const exchangeRate = await getExchangeRate();
  return cryptoAmount * exchangeRate;
}

/**
 * Process a cryptocurrency payment
 * In a real application, this would interact with MetaMask
 */
async function processCryptoPayment(toAddress, amount, currency = "ETH") {
  try {
    // In a real application, this would create a transaction with MetaMask
    // For demo purposes, we'll just simulate a successful transaction
    console.log(`Processing payment of ${amount} ${currency} to ${toAddress}`);

    // Simulate transaction hash
    const txHash = "0x" + Math.random().toString(16).substring(2, 42);

    return {
      success: true,
      transactionHash: txHash,
      amount: amount,
      currency: currency,
    };
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
