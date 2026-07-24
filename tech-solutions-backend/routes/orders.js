const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const sendEmail = require("../utils/sendEmail");
const { orderReceived } = require("../utils/emailTemplates");

function buildTrackUrl(trackingId) {
    const baseUrl = process.env.FRONTEND_URL || "https://tech-solutions-k8ci.onrender.com";
    return `${baseUrl.replace(/\/$/, "")}/track.html?tracking=${encodeURIComponent(trackingId)}`;
}

function createTrackingId(customer) {
    const phoneSuffix = String(customer?.phone || "0000").replace(/\D/g, "").slice(-4);
    return `TS-${Date.now()}-${phoneSuffix}`;
}

router.post("/create", async (req, res) => {
    try {
        const payload = req.body || {};
        const customer = payload.customer || {};
        const cart = Array.isArray(payload.cart) ? payload.cart : [];
        const trackingId = payload.trackingId || createTrackingId(customer);
        const shipmentStatus = payload.shipmentStatus || "In Store";
        const status = payload.status || shipmentStatus;
        const trackUrl = payload.trackUrl || buildTrackUrl(trackingId);

        const orderRecord = {
            tracking_id: trackingId,
            customer_name: customer.name || "Customer",
            customer_phone: customer.phone || "",
            customer_email: customer.email || "",
            county: customer.county || "",
            town: customer.town || "",
            address: customer.address || "",
            landmark: customer.landmark || "",
            notes: customer.notes || "",
            items: cart,
            subtotal: payload.subtotal || 0,
            delivery_fee: payload.deliveryFee || 0,
            total: payload.total || 0,
            payment_status: payload.payment?.status || "Paid",
            shipment_status: shipmentStatus,
            status,
            created_at: new Date().toISOString(),
            tracking_url: trackUrl,
            payment_reference: payload.payment?.MerchantRequestID || payload.payment?.CheckoutRequestID || payload.payment?.receipt || payload.payment?.transactionId || "",
            merchant_request_id: payload.payment?.MerchantRequestID || "",
            checkout_request_id: payload.payment?.CheckoutRequestID || ""
        };

        let createdOrder = null;

        if (supabase && process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) {
            const { data, error } = await supabase
                .from("orders")
                .insert([orderRecord])
                .select()
                .single();

            if (!error) {
                createdOrder = data;
            } else {
                console.error("Supabase order insert failed:", error);
            }
        }

        const emailOrder = {
            tracking_id: trackingId,
            payment_status: orderRecord.payment_status,
            shipment_status: shipmentStatus,
            tracking_url: trackUrl
        };

        if (customer.email) {
            try {
                const template = orderReceived(emailOrder);
                await sendEmail(customer.email, template.subject, template.html);
            } catch (emailError) {
                console.error("Email send failed:", emailError);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            order: {
                tracking_id: trackingId,
                trackingId,
                shipment_status: shipmentStatus,
                payment_status: orderRecord.payment_status,
                status,
                trackUrl,
                created_at: orderRecord.created_at,
                ...createdOrder
            }
        });
    } catch (error) {
        console.error("Order create error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Unable to create order"
        });
    }
});

router.get("/:trackingNumber", async (req, res) => {
    try {
        const { trackingNumber } = req.params;

        if (!supabase || !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
            return res.status(200).json({
                success: true,
                order: {
                    tracking_number: trackingNumber,
                    trackingId: trackingNumber,
                    customer_name: "Customer",
                    status: "In Store",
                    shipment_status: "In Store",
                    county: "",
                    town: "",
                    landmark: "",
                    estimated_delivery: "2-3 business days",
                    created_at: new Date().toISOString(),
                    items: []
                }
            });
        }

        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("tracking_id", trackingNumber)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order: {
                tracking_number: data.tracking_id,
                trackingId: data.tracking_id,
                customer_name: data.customer_name,
                customer: {
                    name: data.customer_name,
                    phone: data.customer_phone,
                    email: data.customer_email,
                    county: data.county,
                    town: data.town,
                    address: data.address,
                    landmark: data.landmark,
                    notes: data.notes
                },
                status: data.status || data.shipment_status || "In Store",
                shipment_status: data.shipment_status || data.status || "In Store",
                county: data.county,
                town: data.town,
                landmark: data.landmark,
                estimated_delivery: data.estimated_delivery || "2-3 business days",
                created_at: data.created_at,
                items: Array.isArray(data.items) ? data.items : []
            }
        });
    } catch (error) {
        console.error("Track order error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Unable to track order"
        });
    }
});

module.exports = router;
