import User from "../models/User.js";
import {generateToken} from "../utility/jwtToken.js";
import { upsertStreamUser } from "../lib/stream.js";


// Signup Controller
export const signup = async (req, res) => {
    const { email, password, fullName } = req.body;

    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists, please use a different email" });
        }

        const idx = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            password, // will be hashed via pre-save hook
            fullName,
            profilePic: randomAvatar,
        });

        // Create user in Stream
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });
        } catch (error) {
            console.error("Error upserting stream user:", error);
            // Optional: decide if you want to rollback newUser creation if stream fails
        }

        const token = generateToken(newUser._id);
        res.cookie("jwt", token, {
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(200).json({ success: true, user: newUser });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Login Controller
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "No user with this email, please signup" });
        }

        const isPasswordCorrect = await existingUser.matchPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(existingUser._id);
        res.cookie("jwt", token, {
            maxAge: 2 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).json({ success: true, user: existingUser });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// Logout Controller
export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
};



export const onboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const { fullName, bio, nativeLanguage, learnLanguage, location } = req.body;

        // Check for missing fields
        const missingFields = [];
        if (!fullName) missingFields.push("fullName");
        if (!bio) missingFields.push("bio");
        if (!nativeLanguage) missingFields.push("nativeLanguage");
        if (!learnLanguage) missingFields.push("learnLanguage");
        if (!location) missingFields.push("location");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: missingFields,
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                fullName,
                bio,
                nativeLanguage,
                learnLanguage,
                location,
                isOnboard: true, // ensure field name matches your schema
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Onboarding completed successfully",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({ message: "Server error during onboarding" });
    }
};
