const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });

        }

        // Create Auth user

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

        // Create profile

        const {

            data: profile,
            error: profileError

        } = await supabase

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

        // Welcome notification

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

            console.log(
                "Notification Error:",
                notificationError.message
            );

        }

        return res.json({

            success: true,
            message: "Registration successful."

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

});

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,
                message: "Email and password required."

            });

        }

        // Authenticate

        const {

            data,
            error

        } = await supabase.auth.signInWithPassword({

            email,
            password

        });

        if (error) {

            return res.status(401).json({

                success: false,
                message: error.message

            });

        }

        // Get profile

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

        // Login notification

        const {

            error: notificationError

        } = await supabase

            .from("notification")

            .insert({

                user_id: profile.id,
                title: "Login Successful 👋",
                message: "You signed in successfully.",
                type: "login",
                is_read: false

            });

        if (notificationError) {

            console.log(
                "Notification Error:",
                notificationError.message
            );

        }

        return res.json({

            success: true,

            session: data.session,

            user: profile

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

});


router.post("/logout", async (req, res) => {

    try {

        await supabase.auth.signOut();

        return res.json({

            success: true,
            message: "Logged out."

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

});


router.get("/me", async (req, res) => {

    try {

        const token = req.headers.authorization?.replace("Bearer ", "");

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

            data: profile,
            error: profileError

        } = await supabase

            .from("users")

            .select("*")

            .eq("id", data.user.id)

            .maybeSingle();

        if (profileError) {

            return res.status(400).json({

                success: false,
                message: profileError.message

            });

        }

        if (!profile) {

            return res.status(404).json({

                success: false,
                message: "User profile not found."

            });

        }

        return res.json({

            success: true,
            user: profile

        });

    }

    catch (err) {

        console.log(err);

        return res.status(500).json({

            success: false,
            message: err.message

        });

    }

});

module.exports = router;
