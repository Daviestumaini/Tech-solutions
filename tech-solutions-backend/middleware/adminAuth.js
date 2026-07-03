const supabase = require("../config/supabase");

async function adminAuth(req, res, next) {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "No authorization token provided."
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

        if (profileError || !profile) {
            return res.status(404).json({
                success: false,
                message: "Admin profile not found."
            });
        }

        if (profile.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        req.user = profile;

        next();

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error."
        });

    }

}

module.exports = adminAuth;