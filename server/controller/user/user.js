"use strict";
var valid = require('validator');
const sha256 = require("sha256");
const Validator = require('../validationController');
const userModel = require("../../model/userModel");

const varifyField = async(field) => {
    if (typeof (field) == "string") {
        field = valid.trim(field);
    }

    if (field != null && field != undefined && field != '') {
        return true
    } else {
        return false
    }
}

var verifyCaptcha = exports.verifyCaptcha = (humanKey) => {
    return new Promise((resolve, reject) => {
        let data = JSON.stringify({
            'secret': `${process.env.captchaSecretKey}`,
            'response': humanKey,
        });

        const config = {
            method: 'post',
            url: `https://www.google.com/recaptcha/api/siteverify`,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                if (response.data.success) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
    })
}

exports.signUp = async (req, res) => {
    try {
        let time = Date.now();
        //validating form data
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }

        if (data.captcha != "" && data.captcha != null && data.captcha != undefined) {
            const isHuman = await verifyCaptcha(data.captcha);
            if (isHuman) {
                let Email = data.email;
                let fullName = data.fullname;
                let password = data.password;
                let re_password = data.re_password;
                let mob = data.mob;

                if (!varifyField(Email)) {
                    return res.status(203).send({ success: false, msg: "Email is required", data: {}, errors: "" });
                } else if (!Validator.emailVerification(Email)) {
                    return res.status(203).send({ success: false, msg: "Please enter a valid email", data: {}, errors: '' });
                } else if (!varifyField(fullName)) {
                    return res.status(203).send({ success: false, msg: "Fullname is required", data: {}, errors: "" });
                } else if (!Validator.fullNameVerification(fullName)) {
                    return res.status(203).send({ success: false, msg: "Please enter valid name", data: {}, errors: '' });
                } else if (!varifyField(re_password)) {
                    return res.status(203).send({ success: false, msg: "Confirm password is required", data: {}, errors: "" });
                } else if (!varifyField(password)) {
                    return res.status(203).send({ success: false, msg: "Password is required", data: {}, errors: "" });
                } else if (!Validator.passWordVerification(password)) {
                    return res.status(203).send({ success: false, msg: "Please enter valid password", data: {}, errors: '' });
                } else if (!varifyField(mob)) {
                    return res.status(203).send({ success: false, msg: "Mobile number is required", data: {}, errors: "" });
                } else {
                    //Checking Email already exist or not
                    const NoOfRecords = await userModel.find({ email: { "$regex": Email, "$options": "i" } }).countDocuments();
                    if (NoOfRecords == 0) {
                        const noOfPhone = await userModel.find({ mob: data.mob }).countDocuments();
                        if (noOfPhone == 0) {
                            if (password == re_password) {
                                let password_hash = sha256(password);
                                //new user
                                const NewUser = new userModel({
                                    fullName: fullName,
                                    email: Email,
                                    password: password_hash,
                                    mob: mob
                                })
                                NewUser.save(NewUser).then(async (data) => {
                                    return res.status(200).send({ success: true, msg: "Registered Successfully", data: {}, errors: '' });
                                }).catch(async (err) => {
                                    return res.status(500).send({
                                        message: err.message || "Some error occurred while creating a create operation"
                                    });
                                });
                            } else {
                                return res.status(202).send({ success: false, msg: "Password and confirm password should be same", data: {}, errors: "" });
                            }
                        } else {
                            return res.status(202).send({ success: false, msg: "Mobile number is already registered", data: {}, errors: "" });
                        }
                    } else {
                        return res.status(203).send({ success: false, msg: "Email already exists", data: {}, errors: '' });
                    }
                }
            } else {
                return res.status(203).send({ success: false, msg: "Invalid captcha", data: {}, errors: "" });
            }
        } else {
            return res.status(203).send({ success: false, msg: "Captcha is required", data: {}, errors: "" });
        }
    } catch (err) {
        return res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.logIn = async (req, res) => {
    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }

        if (data.captcha != "" && data.captcha != null && data.captcha != undefined) {
            const isHuman = await verifyCaptcha(data.captcha);
            if (isHuman) {
                let Email = data.email;
                let password = data.password;

                if (!varifyField(Email)) {
                    return res.status(203).send({ success: false, msg: "Email is required", data: {}, errors: "" });
                } else if (!varifyField(password)) {
                    return res.status(203).send({ success: false, msg: "Password is required", data: {}, errors: "" });
                } else {
                    //checking whether user exist or not
                    await userModel.findOne({ email: { "$regex": Email, "$options": "i" } }).then(async (userData) => {
                        if (userData) {
                            let password_hash = sha256(password);
                            if (userData.password == password_hash) {
                                res.status(200).send({ success: true, msg: "Logged in successfully", data: "", errors: '' });
                            } else {
                                res.status(202).send({ success: false, msg: "Invalid Credentials", data: '', errors: '' });
                            }
                        } else {
                            res.status(203).send({ success: false, msg: "Invalid Credentials", data: '', errors: '' });
                        }

                    });
                }
            } else {
                return res.status(203).send({ success: false, msg: "Invalid captcha", data: {}, errors: "" });
            }
        } else {
            return res.status(203).send({ success: false, msg: "Captcha is required", data: {}, errors: "" });
        }
    } catch (err) {
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}