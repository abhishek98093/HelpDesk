import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.STREAM_API_KEY;
const SECRET_KEY = process.env.STREAM_API_SECRET;

if (!API_KEY || !SECRET_KEY) {
    throw new Error("Stream API key or secret is missing");
}

const streamClient = StreamChat.getInstance(API_KEY, SECRET_KEY, {
    timeout: 10000
});

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.error("Error creating Stream user:", error);
        throw error;
    }
};

export const generateStreamToken = (userId) => {
    return streamClient.createToken(userId);
};
