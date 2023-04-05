/**
 * Create and update SES templates for nicer/better emails.
 * @author Yaba-In Team
 */
 require("dotenv").config({
  "path":"./../../../../../../env/.env.dev"
})
const AWS = require("aws-sdk");
const SES = new AWS.SES({ 
   region: "eu-west-3",
  credentials:{
     accessKeyId:process.env.AWS_SDK_ACCESS_KEY,

     secretAccessKey: process.env.AWS_SDK_SECRET_KEY
   },
   
});

// Let's get the template to create/save
const template = require("./../html/reset-password-template");


(async () => {
  const result = await SES.updateTemplate(template).promise();
//   console.log("Env ",process.env)
})();
