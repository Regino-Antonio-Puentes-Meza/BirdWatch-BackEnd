import messages from "../utils/messages.js";
import UserModel from "../models/UserModel.js";
import bcrypt from "bcrypt";

// get a User
export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);

    if (user) {
      const { password, ...otherDetails } = user._doc;

      res.status(200).json(otherDetails);
    } else {
      res.status(404).json({error: messages.USER.USER_NOT_FOUND}); 
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// update a user
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus, password } = req.body;

  if (id === currentUserId || currentUserAdminStatus) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }

      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({error: messages.AUTH.ACCESS_DENIED_UPDATE_PROFILE}); 
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId, currentUserAdminStatus } = req.body;

  if (currentUserId === id || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json({error: messages.USER.USER_DELETED}); 
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({error: messages.AUTH.ACCESS_DENIED_UPDATE_PROFILE}); 
  }
};

// Follow a User
export const followUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json(messages.USER.ACTION_FORBIDDEN); 
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (!followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $push: { followers: currentUserId } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json(messages.USER.USER_FOLLOWED); 
      } else {
        res.status(403).json(messages.USER.USER_ALREADY_FOLLOWED); 
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

// UnFollow a User
export const UnFollowUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId } = req.body;

  if (currentUserId === id) {
    res.status(403).json(messages.USER.ACTION_FORBIDDEN); 
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(currentUserId);

      if (followUser.followers.includes(currentUserId)) {
        await followUser.updateOne({ $pull: { followers: currentUserId } });
        await followingUser.updateOne({ $pull: { following: id } });

        res.status(200).json(messages.USER.USER_UNFOLLOWED);
      } else {

        res.status(403).json(messages.USER.USER_IS_NOT_FOLLOWED);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};