const redis = require('redis');

const connectRedis = async callback => {
    try {
        if (process.env.PROJECT_ENV === 'local') {
            const client = redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            });
            await client.connect();
            callback(200, 'Redis connetced.', client);
        } else {
            const client = redis.createClient({
                url: process.env.REDIS_URL,
            });
            await client.connect();
            callback(200, 'Redis connetced.', client);
        }
    } catch (error) {
        console.log('Redis error connection -- ', error.message);
        callback(404, error.message, null);
    }
};

module.exports = {
    connectRedis,
};
