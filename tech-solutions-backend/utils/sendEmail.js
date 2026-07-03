const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});

async function sendEmail(to, subject, html) {

    try {

        await transporter.sendMail({

            from: `"Gadget Finds" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html

        });

        console.log("Email sent:", to);

    }

    catch(err){

        console.log("Email Error:", err);

    }

}

module.exports = sendEmail;