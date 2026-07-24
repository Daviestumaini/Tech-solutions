const express = require("express");

const router = express.Router();

function normalizePhone(phone) {
    const cleaned = String(phone || "").replace(/\D/g, "");

    if (!cleaned) {
        return "";
    }

    if (cleaned.startsWith("254")) {
        return cleaned;
    }

    if (cleaned.startsWith("0")) {
        return `254${cleaned.slice(1)}`;
    }

    if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
        return `254${cleaned}`;
    }

    return cleaned;
}

function validPhone(phone) {
    return /^(07|01)\d{8}$/.test(String(phone || "").trim());
}

function buildTimestamp() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

router.post("/stkpush", async (req, res) => {
    try {
        const { phone, amount, customer = {} } = req.body || {};

        if (!validPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid Safaricom phone number."
            });
        }

        const normalizedAmount = Math.round(Number(amount || 0));

        if (!normalizedAmount || normalizedAmount < 1) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero."
            });
        }

        const consumerKey = process.env.DARAJA_CONSUMER_KEY;
        const consumerSecret = process.env.DARAJA_CUSTOMER_SECRET;
        const shortcode = process.env.DARAJA_SHORTCODE;
        const passkey = process.env.DARAJA_PASSKEY;
        const callbackUrl = process.env.DARAJA_CALLBACK_URL || "https://tech-solutions-k8ci.onrender.com/api/payments/callback";

        const accountReference = customer?.name || customer?.customerName || "Tech Solutions";
        const transactionDesc = `Payment for ${accountReference}`;

        if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
            return res.status(200).json({
                success: true,
                mode: "simulated",
                message: "STK push request queued. Configure DARAJA_SHORTCODE and DARAJA_PASSKEY for live dispatch.",
                MerchantRequestID: `SIM-${Date.now()}`,
                CheckoutRequestID: `CR-${Date.now()}`,
                ResponseCode: "0",
                ResponseDescription: "STK push simulated",
                CustomerMessage: "STK push request queued."
            });
        }

        const baseUrl = process.env.DARAJA_BASE_URL || "https://sandbox.safaricom.co.ke";
        const authResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            method: "GET",
            headers: {
                Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")}`
            }
        });

        const authData = await authResponse.json().catch(() => ({}));

        if (!authResponse.ok || !authData.access_token) {
            throw new Error(authData.error_description || "Failed to acquire Daraja access token.");
        }

        const timestamp = buildTimestamp();
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
        const payload = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: process.env.DARAJA_TRANSACTION_TYPE || "CustomerPayBillOnline",
            Amount: normalizedAmount,
            PartyA: normalizePhone(phone),
            PartyB: shortcode,
            PhoneNumber: normalizePhone(phone),
            CallBackURL: callbackUrl,
            AccountReference: accountReference,
            TransactionDesc: transactionDesc
        };

        const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authData.access_token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const stkData = await stkResponse.json().catch(() => ({}));

        if (!stkResponse.ok) {
            throw new Error(stkData.errorMessage || stkData.message || "Daraja STK push request failed.");
        }

        return res.status(200).json({
            success: true,
            message: stkData.CustomerMessage || "STK push request sent.",
            MerchantRequestID: stkData.MerchantRequestID,
            CheckoutRequestID: stkData.CheckoutRequestID,
            ResponseCode: stkData.ResponseCode,
            ResponseDescription: stkData.ResponseDescription,
            CustomerMessage: stkData.CustomerMessage
        });
    } catch (error) {
        console.error("STK push error:", error);
        return res.status(502).json({
            success: false,
            message: error.message || "Unable to send STK push."
        });
    }
});

router.post("/callback", (req, res) => {
    console.log("Daraja callback received:", req.body);
    return res.status(200).json({ success: true, message: "Callback received" });
});

module.exports = router;
