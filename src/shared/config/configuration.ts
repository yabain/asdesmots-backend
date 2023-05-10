
export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    mongoURI: process.env.MONGO_DATABASE_URL,
    NODE_ENV:process.env.NODE_ENV,

    //MOMO API
    MOMO_API_DEFAULT_UUID:process.env.MOMO_API_DEFAULT_UUID,  
    MOMO_API_PRIMARY_KEY:process.env.MOMO_API_PRIMARY_KEY,   
    MOMO_API_SECONDARY_KEY:process.env.MOMO_API_SECONDARY_KEY,  
    MOMO_API_KEY:process.env.MOMO_API_KEY,  
    MOMO_API_PATH:process.env.MOMO_API_PATH,  
    MOMO_API_MODE_ENV:process.env.MOMO_API_MODE_ENV,

    //OM API
    OM_API_PATH:process.env.OM_API_PATH,
    OM_API_USERNAME:process.env.OM_API_USERNAME,
    OM_API_PASSWORD:process.env.OM_API_PASSWORD,
    OM_API_CONSUMER_KEY:process.env.OM_API_CONSUMER_KEY,
    OM_API_CONSUMER_SECRET:process.env.OM_API_CONSUMER_SECRET,

    //Secret for JWT Auth
    SECRET_ENCRIPTION_ALGORITHM:process.env.SECRET_ENCRIPTION_ALGORITHM,
    SECRET_ENCRIPTION_KEY:process.env.SECRET_ENCRIPTION_KEY,

    //AWS
    AWS_SDK_REGION:process.env.AWS_SDK_REGION,
    AWS_SDK_PROFILE:process.env.AWS_SDK_PROFILE,
    AWS_SDK_ACCESS_KEY:process.env.AWS_SDK_ACCESS_KEY,
    AWS_SDK_SECRET_KEY:process.env.AWS_SDK_SECRET_KEY,
    AWS_SDK_UPLOAD_FILE_BUCKET_NAME:process.env.AWS_SDK_UPLOAD_FILE_BUCKET_NAME,


    //Email Sender
    NO_REPLY_EMAIL_SENDER: "asdesmots@gmail.com",
    EMAIL_SENDER_NAME:"AsDesMots No-Reply",
    TEAM_EMAIL_SENDER: "team@smartestlotto.io",

    //Email template name
    EMAIL_TEMPLATE_NEW_REGISTRATION:"new-registration-template",
    EMAIL_TEMPLATE_ACCOUNT_CONFIRMATION:"confirm-email-template",
    EMAIL_TEMPLATE_RESET_PASSWORD:"reset-password-template",
  
    //Frontend
    PUBLIC_FRONTEND_URL: process.env.PUBLIC_FRONTEND_URL,

    //Google API Key
    GOOGLE_API_CLIENTID:process.env.GOOGLE_API_CLIENTID,
    GOOGLE_API_SECRET_KEY:process.env.GOOGLE_API_SECRET_KEY,
    GOOGLE_API_CALLBACK_URL:process.env.GOOGLE_API_CALLBACK_URL,
    GOOGLE_API_URL_PLAYGROUND:'https://developers.google.com/oauthplayground?access_type=offline',
    GOOGLE_API_REFRESH_CODE:process.env.GOOGLE_API_REFRESH_CODE,

    //Google Account
    GOOGLE_ACCOUNT_EMAIL: process.env.GOOGLE_ACCOUNT_EMAIL,
    GOOGLE_ACCOUNT_PASSWORD: process.env.GOOGLE_ACCOUNT_PASSWORD,
    GOOGLE_ACCOUNT_SMTP: "smtp.gmail.com",


  });
  