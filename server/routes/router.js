"use strict";
const express = require("express");
const route = express.Router();
const userRoute = require("../controller/user/user");

//Home Route
route.get("/api", (req, res) => {
    res.status(200).send({ success: true, msg: "API is working", data: {}, errors: '' })
});

//________________________________LogOut_______________________________________
// route.get("/api/logout", JWT.deleteToken)

//_____________________________user____________________________________________
route.post("/api/register", userRoute.signUp);
route.post("/api/login", userRoute.logIn);
// route.post("/api/forget-password", userRoute.forgetPassword);

route.use((req, res, next) => {
    res.status(401).send({ success: false, msg: "Route not found", data: {}, errors: '' });
});


module.exports = route;