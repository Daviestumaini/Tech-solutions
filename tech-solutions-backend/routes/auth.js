const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

// =======================================================
// REGISTER
// POST /api/auth/register
// =======================================================

router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,
                message: "Please fill in all fields."

            });

        }

        // Create Supabase Auth user

        const { data, error } = await supabase.auth.signUp({

            email,
            password

        });

        if (error) {

            return res.status(400).json({

                success: false,
                message: error.message

            });

        }

        const user = data.user;

        if (!user) {

            return res.status(400).json({

                success: false,
                message: "User could not be created."

            });

        }
// Insert profile
const { data: profileData, error: profileError } = await supabase
    .from("users")
    .insert({
        id: user.id,
        name,
        email,
        role: "customer"
    })
    .select()
    .single();

if (profileError) {
    return res.status(400).json({
        success: false,
        message: profileError.message
    });
}

// =======================================
// CREATE WELCOME NOTIFICATION
// =======================================

const { error: notificationError } = await supabase
    .from("notification")
    .insert({
        user_id: user.id,
        title: "Welcome 👋",
        message: "Your account has been created successfully.",
        type: "welcome",
        is_read: false
    });

if (notificationError) {
    console.log("Notification Error:", notificationError.message);
}

res.json({
    success: true,
    message: "Registration successful."
});
       

// =======================================================
// LOGIN
// POST /api/auth/login
// =======================================================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,
                message: "Email and password required."

            });

        }
const {
    data: profile,
    error: profileError
} = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single();

if (profileError) {
    return res.status(400).json({
        success: false,
        message: profileError.message
    });
}

// =======================================
// CREATE LOGIN NOTIFICATION
// =======================================

const { error: notificationError } = await supabase
    .from("notification")
    .insert({
        user_id: profile.id,
        title: "Login Successful 👋",
        message: "You signed in successfully.",
        type: "login",
        is_read: false
    });

if (notificationError) {
    console.log("Notification Error:", notificationError.message);
}

res.json({
    success: true,
    session: data.session,
    user: profile
});


// =======================================================
// LOGOUT
// POST /api/auth/logout
// =======================================================

router.post("/logout", async (req, res) => {

    try {

        await supabase.auth.signOut();

        res.json({

            success: true,
            message: "Logged out."

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

});


// =======================================================
// CURRENT USER
// GET /api/auth/me
// =======================================================

router.get("/me", async (req, res) => {

    try {

        const token =

            req.headers.authorization?.replace("Bearer ", "");

        if (!token) {

            return res.status(401).json({

                success: false,
                message: "Unauthorized."

            });

        }

        const {

            data,
            error

        } = await supabase.auth.getUser(token);

        if (error) {

            return res.status(401).json({

                success: false,
                message: error.message

            });

        }

        const {

            data: profile

        } = await supabase

            .from("users")

            .select("*")

            .eq("id", data.user.id)

            .single();

        res.json({

            success: true,
            user: profile

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
