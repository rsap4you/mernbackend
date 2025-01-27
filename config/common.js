const nodemailer = require('nodemailer');
const dbConn = require("./database");
const userSchema = require("../modules/schema/user_schema");
const redis = require("./redis");

const common = {

    // function for check unique email
    async checkUniqueEmail(req) {
        try {
            const user = await userSchema.findOne({ email: req.email })
            if (user != null) {
                return true;
            }
            return false;

        } catch (error) {
            return error;
        }
    },

    // function for check unique mobile number
    async checkUniqueMobile(mobile_number) {
        try {
            const user = await userSchema.findOne({ mobile_number: mobile_number });
    
            return user
        } catch (error) {
            console.error('Error checking unique mobile number:', error);
            return false; // or you can throw the error if you want to handle it elsewhere
        }
    },
    

    // function for send email
    async send_email(toEmail, sub, message) {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: toEmail,
                subject: sub,
                html: message
            };

            return transporter.sendMail(mailOptions)
        }
        catch (error) {
            return error;
        }

    },

    async getdetails(key, data) {
        return new Promise((resolve, reject) => {
            redis.connectRedis(async (redisCode, redisMessage, redisClient) => {
                if (redisCode === 200) {
                    const value = await redisClient.get(key);
                    if (value) {
                        /**
                         * Retriving data from catch 
                         */
                        //   console.log("catch",key);  
                        resolve(JSON.parse(value));
                    } else {
                        redisClient.set(
                            key,
                            JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? parseInt(v, 10) : v)),
                            {
                                EX: 300,
                            });
                        const valuePromise = redisClient.get(key);

                        valuePromise.then((promisevalue) => {
                            if (promisevalue) {
                                // console.log("set",key);
                                resolve(data);
                            }

                        }).catch((error) => {
                            console.log('Error retrieving value from Redis:', error);
                            return null;
                        });
                    }
                } else {
                    reject(redisMessage);
                }
            });
        });

    }
}

module.exports = common;