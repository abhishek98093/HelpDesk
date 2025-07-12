import User from "../models/User.js";
import {generateToken} from "../utility/jwtToken.js";
import { upsertStreamUser } from "../lib/stream.js";
import validator from 'validator'; 
import xss from 'xss'; 


export const signup = async (req, res) => {
    try {
        const { email, password, fullName } = req.body || {};

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            typeof fullName !== 'string'
        ) {
            return res.status(400).json({ message: "Invalid input types" });
        }

        const sanitizedEmail = xss(email.trim().toLowerCase());
        const sanitizedPassword = xss(password.trim());
        const sanitizedFullName = xss(fullName.trim());

        if (!sanitizedEmail || !sanitizedPassword || !sanitizedFullName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!validator.isEmail(sanitizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (sanitizedPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email: sanitizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists, please use a different email" });
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email: sanitizedEmail,
            password: sanitizedPassword, 
            fullName: sanitizedFullName,
            profilePic: randomAvatar,
        });

        // Upsert Stream user, wrapped in try-catch
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
        } catch (error) {
            console.error("Error upserting stream user:", error);
            // Optionally: rollback user creation or notify admin
        }

        // Generate JWT and set cookie
        const token = generateToken(newUser._id);
        res.cookie("jwt", token, {
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(200).json({
            success: true,
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            }
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: "Invalid input types" });
        }

        const sanitizedEmail = xss(email.trim().toLowerCase());
        const sanitizedPassword = xss(password.trim());

        if (!sanitizedEmail || !sanitizedPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!validator.isEmail(sanitizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email: sanitizedEmail });
        if (!existingUser) {
            
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isPasswordCorrect = await existingUser.matchPassword(sanitizedPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate token and set secure cookie
        const token = generateToken(existingUser._id);
        res.cookie("jwt", token, {
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({
            success: true,
            user: {
                _id: existingUser._id,
                email: existingUser.email,
                fullName: existingUser.fullName,
                profilePic: existingUser.profilePic,
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};


export const logout = (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(200).json({
            success: true,
            message: "Logout successful",
        });

    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};




import xss from 'xss';

export const onboard = async (req, res) => {
    try {
        const userId = req?.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found" });
        }

        const {
            fullName,
            bio,
            nativeLanguage,
            learnLanguage,
            location,
        } = req.body || {};

        // Type and existence checks
        const fields = { fullName, bio, nativeLanguage, learnLanguage, location };
        const missingFields = [];

        for (const [key, value] of Object.entries(fields)) {
            if (typeof value !== 'string' || !value.trim()) {
                missingFields.push(key);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields,
            });
        }

        // Sanitize inputs
        const sanitizedData = {
            fullName: xss(fullName.trim()),
            bio: xss(bio.trim()),
            nativeLanguage: xss(nativeLanguage.trim()),
            learnLanguage: xss(learnLanguage.trim()),
            location: xss(location.trim()),
            isOnboard: true,
        };

        const updatedUser = await User.findByIdAndUpdate(userId, sanitizedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });

            return res.status(200).json({
                success: true,
                message: "Onboarding completed successfully",
                user: {
                    _id: updatedUser._id,
                    fullName: updatedUser.fullName,
                    email: updatedUser.email,
                    profilePic: updatedUser.profilePic,
                    nativeLanguage: updatedUser.nativeLanguage,
                    learnLanguage: updatedUser.learnLanguage,
                    bio: updatedUser.bio,
                    location: updatedUser.location,
                    isOnboard: updatedUser.isOnboard,
                },
            });
        } catch (error) {
            console.error("Stream upsert error:", error);
            return res.status(500).json({ message: "Failed to sync with Stream service" });
        }

    } catch (error) {
        console.error("Onboarding error:", error);
        return res.status(500).json({ message: "Server error during onboarding" });
    }
};

