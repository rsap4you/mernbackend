const mongoose =  require('mongoose');

// const dbUrl = process.env.APP_ENV === "development" ? process.env.DEV_DB_URL : process.env.LIVE_DB_URL;
const dbUrl = process.env.APP_ENV === "development" ? process.env.DEV_DB_URL : process.env.DATABASE;
// const dbUrl =process.env.DATABASE


mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(" Database connected successfully");
    }).catch((error) => {
        console.log(error);
    })




