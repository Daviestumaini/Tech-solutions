function orderReceived(order) {
    return {
        subject: "Order Received - Gadget Finds",
        html: `
            <h2>Thank you for your order!</h2>

            <p>Your order has been received.</p>

            <p><strong>Tracking ID:</strong> ${order.tracking_id}</p>

            <p><strong>Payment Status:</strong> ${order.payment_status}</p>

            <p>Please keep your tracking ID safe.</p>
        `
    };
}

function paymentVerified(order) {
    return {
        subject: "Payment Verified",
        html: `
            <h2>Your payment has been verified.</h2>

            <p>Your order is now being processed.</p>

            <p><strong>Tracking ID:</strong> ${order.tracking_id}</p>
        `
    };
}

function paymentRejected(order) {
    return {
        subject: "Payment Rejected",
        html: `
            <h2>Payment Verification Failed</h2>

            <p>Please contact Gadget Finds support if you believe this is an error.</p>

            <p><strong>Tracking ID:</strong> ${order.tracking_id}</p>
        `
    };
}

function shipmentUpdated(order) {
    return {
        subject: "Order Update",
        html: `
            <h2>Your order has been updated.</h2>

            <p><strong>Status:</strong> ${order.shipment_status}</p>

            <p><strong>Tracking ID:</strong> ${order.tracking_id}</p>
        `
    };
}

module.exports = {
    orderReceived,
    paymentVerified,
    paymentRejected,
    shipmentUpdated
};