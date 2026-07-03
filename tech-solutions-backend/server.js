require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
"/api/auth",
require("./routes/auth")
);

app.use(
  "/api/orders",
  require("./routes/orders")
);

app.use(
    "/api/products",
    require("./routes/products")
);
app.use(
    "/api/admin",
    require("./routes/admin")
);
app.use(
    "/api/notifications",
    require("./routes/notification")
);

app.get("/", (req, res) => {

    res.json({
        message: "Gadget Finds Backend Running"
    });

});

const PORT = process.env.PORT || 5000;
app.get(
"/test-status",
async(req,res)=>{

const supabase =
require("./config/supabase");

const {
data,
error
}=
await supabase
.from("Orders")
.update({

shipment_status:
"In Transit"

})
.eq(
"tracking_id",
"TRK123"
)
.select();

res.json({
data,
error
});

});
app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
app.get("/debug-users", async (req, res) => {

    const supabase = require("./config/supabase");

    const { data, error } = await supabase
        .from("users")
        .select("*");

    res.json({
        data,
        error
    });

});
app.get("/debug-service", async (req, res) => {

    const supabase = require("./config/supabase");

    const { data, error } = await supabase
        .from("users")
        .insert({
            name: "Debug User",
            email: "debug@test.com",
            role: "customer"
        })
        .select();

    res.json({
        data,
        error
    });

});