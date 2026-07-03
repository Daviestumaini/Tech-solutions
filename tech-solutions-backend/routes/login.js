const express = require("express");
const router = express.Router();

const supabase =
require("../config/supabase");

router.post(
"/login",
async(req,res)=>{

try{

const {
email,
password
}=req.body;

const {
data,
error
}=
await supabase.auth.signInWithPassword({

email,
password

});

if(error){

return res
.status(400)
.json(error);

}

res.json({

message:"Login successful",
data

});

}catch(err){

res
.status(500)
.json(err);

}

});

module.exports = router;