"use strict";
const https = require("https");
const express = require('express');
const bodyparser = require("body-parser");
const cors = require('cors');
const connectDB = require('./server/database/connection');

const app = express();

app.use(cors());

// mongodb connection
connectDB();

// support parsing of application/json type post data
app.use(bodyparser.json());
// parse request to body-parser
app.use(bodyparser.urlencoded({ extended: true }))

// load routers
app.use('/', require('./server/routes/router'));


app.listen(5000, () => console.log('RUNING SSL NODE ON AWS ON PORT 443...'));