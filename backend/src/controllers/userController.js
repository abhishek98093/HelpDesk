import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import mongoose from "mongoose";
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getRecommendedUsers = async (req, res) => {
    try {
        const currentUser = req.user;

        if (!currentUser || !isValidObjectId(currentUser._id)) {
            return res.status(401).json({ message: "Unauthorized or invalid user" });
        }

        const recommendedUsers = await User.find({
            _id: {
                $ne: currentUser._id,
                $nin: currentUser.friends || []
            },
            isOnboarded: true,
        }).select("fullName profilePic nativeLanguage learnLanguage");

        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error getting recommended users:", error);
        res.status(500).json({ message: "Server error while fetching recommendations" });
    }
};

export const getMyFriends = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId || !isValidObjectId(userId)) {
            return res.status(401).json({ message: "Unauthorized or invalid user" });
        }

        const user = await User.findById(userId)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learnLanguage");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error getting friends:", error);
        res.status(500).json({ message: "Server error while fetching friends" });
    }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user?.id;
    const { id: recipientId } = req.params;

    // Check for missing IDs
    if (!myId || !recipientId) {
      return res.status(400).json({ message: "Missing user information." });
    }

    // Validate ObjectId format
    if (!isValidObjectId(myId) || !isValidObjectId(recipientId)) {
      return res.status(400).json({ message: "Invalid user ID format." });
    }

    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send a friend request to yourself." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user." });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user.",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return res.status(201).json({
      success: true,
      message: "Friend request sent successfully.",
      data: friendRequest,
    });

  } catch (error) {
    console.error("Send Friend Request Error:", error);
    return res.status(500).json({
      message: "Server error while sending friend request.",
    });
  }
};


export  const acceptFriendRequest=async(req, res)=> {
  try {
    const { id: requestId } = req.params;
    const currentUserId = req.user?.id;

    if (!requestId || !currentUserId) {
      return res.status(400).json({ message: "Missing request ID or user information." });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    if (friendRequest.recipient.toString() !== currentUserId) {
      return res.status(403).json({ message: "You are not authorized to accept this request." });
    }

    const senderId = friendRequest.sender.toString();
    const recipientId = friendRequest.recipient.toString();

    // Prevent self-adding
    if (senderId === recipientId) {
      return res.status(400).json({ message: "Invalid friend request." });
    }

    // Avoid duplicate friendships
    const [sender, recipient] = await Promise.all([
      User.findById(senderId),
      User.findById(recipientId),
    ]);

    if (!sender || !recipient) {
      return res.status(404).json({ message: "One or both users not found." });
    }

    if (sender.friends.includes(recipientId)) {
      return res.status(400).json({ message: "You are already friends." });
    }

    // Update request status and save
    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each other to friends array
    await Promise.all([
      User.findByIdAndUpdate(senderId, {
        $addToSet: { friends: recipientId },
      }),
      User.findByIdAndUpdate(recipientId, {
        $addToSet: { friends: senderId },
      }),
    ]);

    return res.status(200).json({ success: true, message: "Friend request accepted." });

  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getFriendRequests = async (req, res) => {
  try {
    const myId = req.user?.id;

    if (!myId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const [incomingReqs, acceptedReqs] = await Promise.all([
      FriendRequest.find({ recipient: myId, status: "pending" }).populate(
        "sender",
        "fullName profilePic nativeLanguage learnLanguage"
      ),
      FriendRequest.find({ recipient: myId, status: "accepted" }).populate(
        "sender",
        "fullName profilePic"
      ),
    ]);

    return res.status(200).json({
      success: true,
      incomingReqs,
      acceptedReqs,
    });

  } catch (error) {
    console.error("Error fetching friend requests:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching friend requests",
    });
  }
};