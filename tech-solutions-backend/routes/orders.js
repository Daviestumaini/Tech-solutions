const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const adminAuth = require("../middleware/adminAuth");

const sendEmail = require("../utils/sendEmail");

const {
    orderReceived,
    paymentVerified,
    paymentRejected,
    shipmentUpdated
} = require("../utils/emailTemplates");

// =====================================================
// CUSTOMER CREATE ORDER
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {

            user_id,
            amount,
            mpesa_code,
            payment_phone,
            customer_email,
            items

        } = req.body;

        const tracking_id =
            "TRK" +
            Math.random()
                .toString(36)
                .substring(2,10)
                .toUpperCase();

        const { data, error } =
        await supabase

        .from("Orders")

        .insert({

            user_id,

            amount,

            mpesa_code,

            payment_phone,

            customer_email,

            items,

            tracking_id,

            payment_status:
            "Pending Verification",

            shipment_status:
            "Pending"

        })

        .select()

        .single();

        if(error){

            return res.status(400).json({

                success:false,

                message:error.message

            });

        }

        const email =
        orderReceived(data);

        await sendEmail(

            customer_email,

            email.subject,

            email.html

        );

        res.json({

            success:true,

            order:data

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

// =====================================================
// CUSTOMER TRACK ORDER
// =====================================================

router.get("/track/:tracking_id", async(req,res)=>{

    try{

        const {tracking_id}=req.params;

        const {data,error}=

        await supabase

        .from("Orders")

        .select("*")

        .eq("tracking_id",tracking_id)

        .single();

        if(error){

            return res.status(404).json({

                success:false,

                message:"Order not found."

            });

        }

        res.json({

            success:true,

            order:data

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

// =====================================================
// ADMIN GET ALL ORDERS
// =====================================================

router.get("/",adminAuth,async(req,res)=>{

    try{

        const {data,error}=

        await supabase

        .from("Orders")

        .select("*")

        .order(

            "created_at",

            {

                ascending:false

            }

        );

        if(error){

            return res.status(400).json({

                success:false,

                message:error.message

            });

        }

        res.json(data);

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});

// =====================================================
// ADMIN VERIFY PAYMENT
// =====================================================

router.put("/verify/:id",adminAuth,async(req,res)=>{

    try{

        const {id}=req.params;

        const adminId=req.admin.id;

        const {data,error}=

        await supabase

        .from("Orders")

        .update({

            payment_status:
            "Verified",

            verified_by:
            adminId,

            verified_at:
            new Date().toISOString(),

            shipment_status:
            "Processing"

        })

        .eq("id",id)

        .select()

        .single();

        if(error){

            return res.status(400).json({

                success:false,

                message:error.message

            });

        }

        const email =
        paymentVerified(data);

        await sendEmail(

            data.customer_email,

            email.subject,

            email.html

        );

        res.json({

            success:true,

            order:data

        });

    }

    catch(err){

        res.status(500).json({

            success:false,

            message:err.message

        });

    }

});
// =====================================================
// ADMIN REJECT PAYMENT
// =====================================================

router.put("/reject/:id", adminAuth, async (req, res) => {

    try {

        const { id } = req.params;

        const adminId = req.admin.id;

        const { data, error } = await supabase
            .from("Orders")
            .update({

                payment_status: "Rejected",

                verified_by: adminId,

                verified_at: new Date().toISOString()

            })
            .eq("id", id)
            .select()
            .single();

        if (error) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

        const email = paymentRejected(data);

        await sendEmail(

            data.customer_email,

            email.subject,

            email.html

        );

        res.json({

            success: true,

            order: data

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// =====================================================
// ADMIN UPDATE SHIPMENT STATUS
// =====================================================

router.put("/:id", adminAuth, async (req, res) => {

    try {

        const { id } = req.params;

        const { shipment_status } = req.body;

        const { data, error } = await supabase

            .from("Orders")

            .update({

                shipment_status

            })

            .eq("id", id)

            .select()

            .single();

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        const email = shipmentUpdated(data);

        await sendEmail(

            data.customer_email,

            email.subject,

            email.html

        );

        res.json({

            success: true,

            order: data

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// =====================================================
// ADMIN DELETE ORDER
// =====================================================

router.delete("/:id", adminAuth, async (req, res) => {

    try {

        const { id } = req.params;

        const { error } = await supabase

            .from("Orders")

            .delete()

            .eq("id", id);

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            message: "Order deleted successfully."

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

module.exports = router;