const express = require("express");
const router = express.Router();

const supabase =
require("../config/supabase");

// ========================================
// GET USER NOTIFICATIONS
// GET /api/notifications/:user_id
// ========================================

router.get("/:user_id", async (req, res) => {

    try {

        const { user_id } = req.params;

        const { data, error } = await supabase

            .from("Notification")

            .select("*")

            .eq("user_id", user_id)

            .order("created_at", {

                ascending: false

            });

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        res.json(data);

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// ========================================
// MARK ALL AS READ
// PUT /api/notifications/read-all/:user_id
// ========================================

router.put("/read-all/:user_id", async (req, res) => {

    try {

        const { user_id } = req.params;

        const { data, error } = await supabase

            .from("Notification")

            .update({

                is_read: true

            })

            .eq("user_id", user_id)

            .select();

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        res.json({

            success: true,

            notifications: data

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// ========================================
// MARK ONE AS READ
// PUT /api/notifications/:id
// ========================================

router.put("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase

            .from("Notification")

            .update({

                is_read: true

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

        res.json({

            success: true,

            notification: data

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});

// ========================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ========================================

router.delete("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const { error } = await supabase

            .from("Notification")

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

            message: "Notification deleted."

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