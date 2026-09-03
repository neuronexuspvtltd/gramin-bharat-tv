/**
 * =========================================================================
 * 🇮🇳 GRAMIN BHARAT TV - RAZORPAY PAYMENT GATEWAY CONFIGURATION
 * =========================================================================
 * 
 * 📌 येथे तुमचे RAZORPAY KEYS टाका (ENTER YOUR RAZORPAY KEYS HERE):
 * -------------------------------------------------------------------------
 * 1. Razorpay Dashboard (https://dashboard.razorpay.com/) -> Settings -> API Keys वर जा.
 * 2. Key ID आणि Key Secret खालील व्हेरिएबल्समध्ये पेस्ट करा.
 * 3. Test Mode साठी 'rzp_test_...' आणि Live Production साठी 'rzp_live_...' वापरा.
 * =========================================================================
 */

// ⚠️ 1. तुमचा RAZORPAY KEY ID येथे टाका (PASTE KEY ID HERE):
const RAZORPAY_KEY_ID = "rzp_live_TWLI6C7vgDtku3";

// ⚠️ 2. तुमचा RAZORPAY KEY SECRET येथे टाका (PASTE KEY SECRET HERE):
const RAZORPAY_KEY_SECRET = "T7yNM2kCrM3qVxWpIKkTpw8m";

// 💰 3. नोंदणी शुल्क रक्कम (REGISTRATION FEE IN RUPEES):
const REGISTRATION_FEE_INR = 1100;

// =========================================================================
// DEFAULT CONFIGURATION OBJECT
// =========================================================================
const DEFAULT_RAZORPAY_CONFIG = {
  keyId: RAZORPAY_KEY_ID,
  keySecret: RAZORPAY_KEY_SECRET,
  amount: REGISTRATION_FEE_INR,
  currency: "INR",
  merchantName: "Gramin Bharat TV",
  merchantLogo: "assets/logo.png",
  description: "नामदार महाराष्ट्राचा - सरपंच सन्मान अधिकृत नोंदणी शुल्क",
  themeColor: "#ea580c",
  enabled: true
};

const RAZORPAY_STORAGE_KEY = "GBTV_RAZORPAY_CONFIG_STORE";

/**
 * Get active Razorpay configuration (merges code keys with Admin panel overrides if any)
 */
function getRazorpayConfig() {
  let cfg = { ...DEFAULT_RAZORPAY_CONFIG };
  try {
    const raw = localStorage.getItem(RAZORPAY_STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      cfg = { ...cfg, ...stored };
    }
  } catch (err) {
    console.warn("Could not read Razorpay config from storage:", err);
  }

  // If code has real key, give preference to code or stored key
  if (RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes("YOUR_KEY_ID_HERE")) {
    cfg.keyId = RAZORPAY_KEY_ID;
  }
  if (RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_SECRET.includes("YOUR_KEY_SECRET_HERE")) {
    cfg.keySecret = RAZORPAY_KEY_SECRET;
  }
  return cfg;
}

/**
 * Save Razorpay configuration (from Admin Panel)
 */
function saveRazorpayConfig(newConfig) {
  try {
    const current = getRazorpayConfig();
    const merged = { ...current, ...newConfig };
    localStorage.setItem(RAZORPAY_STORAGE_KEY, JSON.stringify(merged));

    if (typeof window !== "undefined" && window.gbtvFirebase && typeof window.gbtvFirebase.saveCmsData === "function") {
      const cms = window.getCmsData ? window.getCmsData() : {};
      cms.razorpayConfig = merged;
      window.gbtvFirebase.saveCmsData(cms);
    }
    return true;
  } catch (err) {
    console.error("Failed to save Razorpay config:", err);
    return false;
  }
}

/**
 * Direct Razorpay Standard Checkout
 * Opens the official Razorpay Checkout modal directly.
 * The form is ONLY submitted after the payment is successfully completed in Razorpay.
 *
 * @param {Object} customerData - Customer details (fullName, mobile, email, village, regId)
 * @param {Function} onSuccess - Callback when payment succeeds (receives payment details)
 * @param {Function} onDismiss - Callback when user cancels or closes payment window
 * @param {Function} onError - Callback on payment failure
 */
function launchRazorpayCheckout(customerData, onSuccess, onDismiss, onError) {
  const config = getRazorpayConfig();

  // If online payment is turned off by admin, bypass as free
  if (!config.enabled) {
    if (typeof onSuccess === "function") {
      onSuccess({
        razorpay_payment_id: "FREE_REGISTRATION",
        payment_status: "FREE",
        amount_paid: 0,
        currency: config.currency || "INR",
        method: "Free Registration"
      });
    }
    return;
  }

  // Check if Key ID has been configured
  const keyId = config.keyId ? config.keyId.trim() : "";
  if (!keyId || keyId.includes("YOUR_KEY_ID_HERE") || keyId === "rzp_test_YOUR_KEY_ID_HERE") {
    alert(
      "⚠️ Razorpay Key ID टाकलेला नाही!\n\n" +
      "कृपया 'js/razorpay-config.js' फाईलमध्ये तुमचा Razorpay Key ID (उदा. rzp_test_... किंवा rzp_live_...) टाका.\n\n" +
      "(Please open js/razorpay-config.js and paste your Razorpay Key ID at line 16)."
    );
    if (typeof onDismiss === "function") {
      onDismiss("Razorpay Key ID missing");
    }
    return;
  }

  // Verify Razorpay Checkout SDK is loaded
  if (typeof Razorpay === "undefined") {
    alert("⚠️ Razorpay SDK लोड झाले नाही. कृपया तुमचे इंटरनेट कनेक्शन तपासा आणि पेज रिफ्रेश करा.");
    if (typeof onError === "function") onError("Razorpay SDK not loaded");
    return;
  }

  const feeAmountInPaise = Math.round(Number(config.amount || 1100) * 100);
  const cleanMobile = (customerData.mobile || "").replace(/[^0-9]/g, "").slice(-10);

  // Direct Razorpay Standard Checkout Options
  const options = {
    key: keyId,
    amount: feeAmountInPaise,
    currency: config.currency || "INR",
    name: config.merchantName || "Gramin Bharat TV",
    description: config.description || "नामदार महाराष्ट्राचा - सरपंच नोंदणी शुल्क",
    image: config.merchantLogo || "assets/logo.png",
    prefill: {
      name: customerData.fullName || "",
      email: customerData.email || "",
      contact: cleanMobile ? `+91${cleanMobile}` : ""
    },
    notes: {
      registration_id: customerData.regId || "",
      sarpanch_name: customerData.fullName || "",
      village: customerData.village || "",
      taluka: customerData.taluka || "",
      district: customerData.district || "",
      mobile: customerData.mobile || ""
    },
    theme: {
      color: config.themeColor || "#ea580c"
    },
    modal: {
      ondismiss: function () {
        console.log("Razorpay Checkout closed by user without completing payment.");
        if (typeof onDismiss === "function") {
          onDismiss("Payment modal closed by user");
        }
      },
      escape: true,
      backdropclose: false
    },
    handler: function (response) {
      console.log("✓ Razorpay Payment Success:", response);
      // ONLY called when payment is 100% completed successfully
      if (typeof onSuccess === "function") {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id || "",
          razorpay_signature: response.razorpay_signature || "",
          payment_status: "PAID",
          amount_paid: config.amount || 1100,
          currency: config.currency || "INR",
          method: "Razorpay Online"
        });
      }
    }
  };

  try {
    const rzp = new Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.error("Razorpay Payment Failed:", response.error);
      alert(`⚠️ पेमेंट अयशस्वी झाले:\n${response.error.description || 'कृपया पुन्हा प्रयत्न करा.'}`);
      if (typeof onError === "function") {
        onError(response.error);
      }
    });

    // Directly open Razorpay checkout modal
    rzp.open();
  } catch (err) {
    console.error("Error launching Razorpay:", err);
    alert("Razorpay पेमेंट सुरू करताना त्रुटी आली: " + err.message);
    if (typeof onError === "function") {
      onError(err);
    }
  }
}

// Export for global window use
if (typeof window !== "undefined") {
  window.RAZORPAY_KEY_ID = RAZORPAY_KEY_ID;
  window.RAZORPAY_KEY_SECRET = RAZORPAY_KEY_SECRET;
  window.REGISTRATION_FEE_INR = REGISTRATION_FEE_INR;
  window.DEFAULT_RAZORPAY_CONFIG = DEFAULT_RAZORPAY_CONFIG;
  window.getRazorpayConfig = getRazorpayConfig;
  window.saveRazorpayConfig = saveRazorpayConfig;
  window.launchRazorpayCheckout = launchRazorpayCheckout;
}
