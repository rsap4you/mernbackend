const mongoose =  require('mongoose');

// const dbUrl = process.env.APP_ENV === "development" ? process.env.DEV_DB_URL : process.env.LIVE_DB_URL;
const dbUrl = process.env.APP_ENV === "development" ? process.env.DEV_DB_URL : 'mongodb+srv://kumaramarjeetraj7725:fennn5rlpwlNF8pO@cluster0.mdlovbh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected successfully");
    }).catch((error) => {
        console.log(error);
    })

    