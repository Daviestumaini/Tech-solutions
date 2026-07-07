const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");


// ======================================================
// GET ALL PRODUCTS (Public)
// ======================================================

router.get("/", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("Products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json(error);
        }

        res.json(data);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// ======================================================
// GET SINGLE PRODUCT (Public)
// ======================================================

router.get("/:id", async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase
            .from("Products")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(404).json(error);
        }

        res.json(data);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;