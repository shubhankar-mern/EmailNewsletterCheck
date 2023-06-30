const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { verify } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const router = require('./Routes/index');
const EmailSender = require('./EmailSystem/index');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(
//     session({
//       name: 'news_bingo',
//       secret: 'secretisoutfinally',
//       resave: false,
//       saveUninitialized: false,
//       cookie: {
//         //secure:true,
//         httpOnly: true,
//         maxAge: 20 * 60 * 1000,
//       },
//     })
//   );
//use router
app.use('/', router)

app.listen(PORT,(err)=>{
    if(err){
        console.log(err);
    }else{
        console.log(`Server running in ${PORT}`)
    }
})