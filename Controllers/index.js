const pool = require('../Config/db');
const bcrypt = require('bcrypt');
const { verify } = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const EmailSender = require('../EmailSystem/index');

const saltRounds = 10;
const {
  CreateAndInsertUsers,
  FindUser,
  FindUserPassword,
  UpdateUserPassword,
  FindUserSubscription,
  UpdateUserSubscription,
  GetAllInfo,
} = require('../Model/query');


   //get all suggestion
   module.exports.getAllInfo = async function(req,res){
    try {
      const list = await GetAllInfo();
      let listArr = [];
      
      list.forEach((ele)=>{
       let obj = {
        name: ele.name,
        email: ele.email,
        interests: ele.suggestion,
       }
       listArr.push(obj);
      })

  

      return res.status(200).json({ 
        status: 'success',
        list: listArr,
     });
    } catch (error) {
      console.log(error.message);
        return res.status(404).json({ 
          status: 'failure',
          data: `${error.message}`,
          list: [],
          
       });
      }
    }
  
  //Register a new user
  module.exports.register = async function (req, res) {
    try {
      const body = req.body;
      console.log(body);
      const { email } =  req.body;
      //bcrypt password operation
      
        // Store hash in your password DB.
        CreateAndInsertUsers( email );
        sendWelcomeEmail(email);

      return res.status(200).json({ 
        data: ' Successfully Created',
        status: 'success'
     });
    } catch (error) {
      console.log(error.message);
      return res.status(404).json({ 
        data: `${error.message}`,
        status: 'failure'
     });
    }
  };
  
 const sendWelcomeEmail = (email)=>{
  const emailSender = new EmailSender();
  emailSender
 .sendWelcomeEmails(email)
 .then(response => {
   console.log('welcome Email sent:', response);
 })
 .catch(error => {
   console.error('Error sending welcome email:', error);
 });
 }

 const sendSubscriptionEmail = (data)=>{
  const emailSender = new EmailSender();
  emailSender
 .sendSubscriptionEmails(data)
 .then(response => {
   console.log('Subscription Email sent:', response);
 })
 .catch(error => {
   console.error('Error sending Subscription email:', error);
 });
 }

  //jwtfunc
 
  //login into your account
  module.exports.login = async function (req, res) {
    try {
            //const body = req.body;
            const userEmail = req.body.email;
            const findUser = await FindUser(userEmail);
                        if (typeof(findUser) !== "undefined") {
                            console.log('finduser in database', findUser);
                            //const myHashedDBpassword = findUser.password;
                            //console.log(req.session);
                            //req.session.email = userEmail;
                            // console.log('this is session data boyos: ', req.session);
                            // console.log('this is session data boyos ID: ', req.sessionID);
                            // console.log('this is session data boyos .id : ', req.session.id);
                            //console.log('this is cookie : ', req.cookies);
                            
                                         //jwt ends
                                         if (findUser) {
                                                const token = jwt.sign(
                                                  { email: findUser.email },
                                                  'secretkey',
                                                  {
                                                      expiresIn: '7d',
                                                  }
                                                  );

                                                  console.log('jwt token', token);
                                                  res.cookie('access_token', token, {
                                                  maxAge: 7 * 24 * 60 * 60 * 1000,
                                                  httpOnly: true,
                                                  });



                                                return res.status(200).json({ 
                                                  data: ' Successfully LoggedIn',
                                                  status: 'success',
                                                  meta : findUser,
                                                  cookies: req.cookies,
                                                  tokenjwt: token 
                                               });
                                              
                                            };

                            }else{
                                return res.status(404).json({ 
                                    data: 'UserEmail  is Invalid or user does not exist',
                                    status: 'failure'
                                 });
                            }
        
    } catch (error) {
      console.log(error.message);
      return res.status(404).json({ 
        data: `${error.message}`,
        status: 'failure'
     });
    }
  };

  //update suggestion
module.exports.subscribe = async function(req,res){
  try {
   
    console.log('user1:',req.user);
    const email = req.user;
    
    
    const suggestionArray = req.body.suggestion;
    const key = await UpdateUserSubscription(suggestionArray,email);
    const data = { suggestionArray, email };
    sendSubscriptionEmail(data);
    return res.status(200).json({ 
      data: ' Successfully Updated',
      status: 'success'
   });
  } catch (error) {
    console.log(error.message);
      return res.status(404).json({ 
        data: `${error.message}`,
        status: 'failure'
     });
    }
  }

    //get all suggestion
module.exports.subscribelist = async function(req,res){
  try {
    const email = req.user;
    const list = await FindUserSubscription(email);
    return res.status(200).json({ 
      data: ' Successfully Retrieved List',
      list: list,
      status: 'success'
   });
  } catch (error) {
    console.log(error.message);
      return res.status(404).json({ 
        data: `${error.message}`,
        status: 'failure'
     });
    }
  }


  //update password
  module.exports.passupdate = async function(req,res){
    try {
      const email = req.user;
      const newpass = req.body.newpassword;
      const Abc = await UpdateUserPassword(email,newpass);
      return res.status(200).json({ 
        data: ' Successfully Updated Password',
        status: 'success'
     });
    } catch (error) {
      console.log(error.message);
        return res.status(404).json({ 
          data: `${error.message}`,
          status: 'failure'
       });
      }
    }


  //authorization
  
  module.exports.authorization = function (req, res, next) {
    const token = req.cookies.access_token;
    if (token) {
      jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token' });
        }
        console.log('decccccffded',decoded)
        req.user = decoded.email;
        next();
      });
    } else {
      res.status(401).json({ message: 'Token not found' });
    }
    
  };

   //logout
   module.exports.destroySession = function (req, res) {
    res.clearCookie('access_token');
    
    return res.status(200).json({ 
        data: 'Session Destroyed! Logged Out',
        status: 'success'
     });
  };