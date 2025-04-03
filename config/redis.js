import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config({});

export const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: "redis-10910.c99.us-east-1-4.ec2.redns.redis-cloud.com",
        port: 10910,
    }
});


export const connectToRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis!!");
    } catch (error) {
        console.log(error);
    }
}


