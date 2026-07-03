const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const adminAuth = require("../middleware/adminAuth");

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

// ======================================================
// ADD PRODUCT (Admin Only)
// ======================================================

router.post("/", adminAuth, async (req, res) => {

    try {

        const {
            name,
            price,
            image,
            category,
            rating,
            delivery
        } = req.body;

        const { data, error } = await supabase
            .from("Products")
            .insert({
                name,
                price,
                image,
                category,
                rating,
                delivery
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json(error);
        }

        res.json({
            success: true,
            product: data
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// ======================================================
// UPDATE PRODUCT (Admin Only)
// ======================================================

router.put("/:id", adminAuth, async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            price,
            image,
            category,
            rating,
            delivery
        } = req.body;

        const { data, error } = await supabase
            .from("Products")
            .update({
                name,
                price,
                image,
                category,
                rating,
                delivery
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return res.status(400).json(error);
        }

        res.json({
            success: true,
            product: data
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// ======================================================
// DELETE PRODUCT (Admin Only)
// ======================================================

router.delete("/:id", adminAuth, async (req, res) => {

    try {

        const { id } = req.params;

        const { error } = await supabase
            .from("Products")
            .delete()
            .eq("id", id);

        if (error) {
            return res.status(400).json(error);
        }

        res.json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

module.exports = router;