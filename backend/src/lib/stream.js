import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.STREAM_API_KEY;
const SECRET_KEY = process.env.STREAM_SECRET_KEY;

if (!API_KEY || !SECRET_KEY) {
    console.log("Stream API key or secret is missing");
}

const streamClient = StreamChat.getInstance(API_KEY, SECRET_KEY);

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData); // accepts a single user object
        return userData;
    } catch (error) {
        console.log("Error creating user: ", error);
    }
};

export const generateStreamToken = (userId) => {
    return streamClient.createToken(userId);
};
