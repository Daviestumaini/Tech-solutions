const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.post("/login", async (req, res) => {

    try {

        const { email, password, adminCode } = req.body;

        if (!email || !password || !adminCode) {

            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });

        }

        if (adminCode !== process.env.ADMIN_ACCESS_CODE) {

            return res.status(401).json({
                success: false,
                message: "Invalid admin access code."
            });

        }

        const { data, error } =
            await supabase.auth.signInWithPassword({

                email,
                password

            });
            console.log("AUTH ERROR:", error);
console.log("AUTH USER:", data?.user);

        if (error) {

            return res.status(401).json({
                success: false,
                message: error.message
            });

        }

       const { data: profiles, error: profileError } =
await supabase
.from("users")
.select("*")
.eq("id", data.user.id);

if (profileError) {
    return res.status(400).json({
        success: false,
        message: profileError.message
    });
}

const profile = profiles.find(
    p => p.role.toLowerCase() === "admin"
);

if (!profile) {
    return res.status(403).json({
        success: false,
        message: "Admin account not found."
    });
}

        res.json({

            success: true,

            session: data.session,

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