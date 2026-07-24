// ==========================================================
// EMAIL.JS
// Sends the receipt email once a payment is confirmed.
// Uses your existing nodemailer setup — adjust the transporter
// config below to match whatever you already have wired up
// (Gmail app password, SendGrid SMTP, etc.)
// ==========================================================

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function formatKES(amount) {
    return Number(amount || 0).toLocaleString("en-KE");
}

function buildReceiptHtml(order) {

    const itemsHtml = (order.cart || [])
        .map(item => `
            <tr>
                <td style="padding:8px 0;">${item.name}</td>
                <td style="padding:8px 0; text-align:center;">${item.quantity}</td>
                <td style="padding:8px 0; text-align:right;">KES ${formatKES(item.price)}</td>
            </tr>
        `)
        .join("");

    return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">

        <h2 style="margin-bottom: 4px;">Payment Received — Thank You!</h2>
        <p style="color: #555;">Your order with Tech Solutions has been confirmed.</p>

        <table style="width: 100%; margin: 16px 0; border-collapse: collapse;">
            <tr>
                <td style="padding: 4px 0;"><strong>Tracking ID</strong></td>
                <td style="padding: 4px 0; text-align: right;">${order.tracking_id}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0;"><strong>M-Pesa Receipt</strong></td>
                <td style="padding: 4px 0; text-align: right;">${order.mpesa_receipt || "-"}</td>
            </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #eee;">

        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 8px 0; border-bottom: 1px solid #eee;">Item</th>
                    <th style="text-align: center; padding: 8px 0; border-bottom: 1px solid #eee;">Qty</th>
                    <th style="text-align: right; padding: 8px 0; border-bottom: 1px solid #eee;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <table style="width: 100%; margin-top: 12px; border-collapse: collapse;">
            <tr>
                <td style="padding: 4px 0;">Subtotal</td>
                <td style="padding: 4px 0; text-align: right;">KES ${formatKES(order.subtotal)}</td>
            </tr>
            <tr>
                <td style="padding: 4px 0;">Delivery Fee</td>
                <td style="padding: 4px 0; text-align: right;">KES ${formatKES(order.delivery_fee)}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Total Paid</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">KES ${formatKES(order.total)}</td>
            </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">

        <p style="color: #555;">
            You can track your delivery any time using your tracking ID
            (<strong>${order.tracking_id}</strong>) on the
            <a href="${process.env.STORE_URL || '#'}/track.html">Track Order</a> page.
        </p>

        <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Tech Solutions · support@techsolutions.co.ke
        </p>

    </div>
    `;

}

async function sendReceiptEmail(order) {

    if (!order.customer_email) {
        console.warn(`No email on order ${order.tracking_id} — skipping receipt.`);
        return;
    }

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Tech Solutions" <${process.env.EMAIL_USER}>`,
        to: order.customer_email,
        subject: `Payment Confirmed — Order ${order.tracking_id}`,
        html: buildReceiptHtml(order)
    });

}

module.exports = { sendReceiptEmail };