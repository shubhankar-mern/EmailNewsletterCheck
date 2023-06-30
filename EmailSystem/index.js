const nodemailer = require('nodemailer');
const cron = require('node-cron');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const {
  GetAllInfo,
} = require('../Model/query');
const logger = require('pino')()


class EmailSender {
    constructor() {
      /** Set up the transporter using your SMTP server details*/ 
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'shubhankardev8@gmail.com',
          pass: 'rdpirbffomjwolmp',
        },
      });
    }
  /** welcome mail */ 
    async sendWelcomeEmails(userEmail){
      const template = await this.loadTemplate('welcomeEmail.ejs');
      const data = { userEmail };
      const html = this.renderTemplate(template, data);
      const mailOptions = {
        from: 'shubhankardev8@gmail.com',
        to: userEmail,
        subject: 'Welcome Mail',
        html,
      };
      await this.sendEmail(mailOptions);
    }
/** subscription mail */
    async sendSubscriptionEmails(userdata){
      const template = await this.loadTemplate('subscribed.ejs');
      const data = { userdata };
      const html = this.renderTemplate(template, data);
      const mailOptions = {
        from: 'shubhankardev8@gmail.com',
        to: userdata.email,
        subject: 'Subscription Mail',
        html,
      };
      await this.sendEmail(mailOptions);
    }
/** weekly mails */
    async sendWeeklyEmails(registeredUsers) {
      const template = await this.loadTemplate('weeklyUpdate.ejs');
  
      for (const user of registeredUsers) {

        const interests = user.interests; // Assuming `interests` is an array of strings
        const items = await this.fetchItems(interests);
        //const items = interests;
        const data = {
          user,
          items,
        };
         
        const html = this.renderTemplate(template, data);
  
        const mailOptions = {
          from: 'shubhankardev8@gmail.com',
          to: user.email,
          subject: 'Weekly Update',
          html,
        };
  
        await this.sendEmail(mailOptions);
      }
    }
  
    async fetchItems(interests) {
      try {
        // Make an API request to fetch the items based on the user's interests
        let final = [];
        for(const url of interests){
          try {
            
            const randInti = Math.floor(Math.random() * 1000) + 1;
            const response = await axios.get(`https://api.springernature.com/metadata/json`, {
                params: {
                  'api_key': 'b134641ef0d30d95f1df43d28e5f2a22',
                  'q': `${url}`,
                  's': `${randInti}`,
                  'p': '15',
                },
                timeout: 300000,
                headers: {
                  'accept': '*/*'
                }
          });
         
          // const obj = {
          //   url: response.records[0].url[0].value,
          //   title: response.records[0].title,
          //   abstract: response.records[0].abstract,
          // }
          if (response) {
            const randInt = Math.floor(Math.random() * 7) + 1;
            const obj = {
            url: response.data.records[randInt].url[0].value,
            title: response.data.records[randInt].title,
            abstract: response.data.records[randInt].abstract,
          }
            final.push(obj);
          } else {
            console.error('No records found in the API response.');
          }
        } catch (error) {
          console.error(`Error fetching data from ${url}: ${error.message}`);
        }
          
        }
       
          return final;
        //return response.data.items;
      } catch (error) {
        console.error('Error fetching items:', error);
        return []; // Return an empty array if there's an error
      }
    }

    async loadTemplate(templateName) {
      const templatePath = path.join(__dirname,'..', 'views', 'emails', templateName);
      const template = await fs.promises.readFile(templatePath, 'utf-8');
      return template;
    }
  
    renderTemplate(template, data) {
      return ejs.render(template, data);
    }
  
    sendEmail(mailOptions) {
      return this.transporter.sendMail(mailOptions);
    }
  }
  
 

const cronSchedule = '0 * * * *';

const sendHelloEmail = (listArr) =>{
   // Example usage
   const emailSender = new EmailSender();
   emailSender
     .sendWeeklyEmails(listArr)
     .then(response => {
       console.log('Email sent:', response);
     })
     .catch(error => {
       console.error('Error sending email:', error);
     });
}

  cron.schedule(cronSchedule, async() => {
    // This code will be executed every two minutes
    // Place your email-sending logic here
   // const list = await GetAllInfo();
   const list = [{email: 'shubhankar.singh@zeeve.io', suggestion: ["computer science","fat loss", "fitness", "stock market", "love"]}]
    processData(list);
    //sendHelloEmail();
  });

  function processData(list) {
    let listArr = [];
    
    list.forEach((ele)=>{
     let obj = {
      email: ele.email,
      interests: ele.suggestion,
     }
     listArr.push(obj);
    })
     logger.info({listArr},'data is here in process: ');
    sendMailerFunction(listArr);
  }

  function sendMailerFunction(listArr) {
    logger.info({listArr},'data is here in send mailer: ');
   sendHelloEmail(listArr);
  }
  
  module.exports = EmailSender;