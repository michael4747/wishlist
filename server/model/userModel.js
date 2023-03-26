"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mob :{
        type: String,
        required: true
    }

})

const User = mongoose.model('user', schema);

module.exports = User;