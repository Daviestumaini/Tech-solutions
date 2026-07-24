require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
    "/api/products",
    require("./routes/products")
);

app.use(
    "/api/orders",
    require("./routes/orders")
);

app.use(
    "/api/payments",
    require("./routes/payments")
);

app.get("/", (req, res) => {

    res.json({
        message: "Tech Solutions Backend Running"
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
.from("orders")
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
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `Server running on port ${PORT}`
        );
    });
}

module.exports = { app };
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
