import mongoose from "mongoose";
import { UserSchema } from "../models/userModel.js";
const User = mongoose.model("User", UserSchema);

export const addNewUser = async (req, res) => {
  try {
    const user = await new User(req.body).save();
    res.json(user);
  } catch (err) {
    res.send(err);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.send(err);
  }
};

export const getUsersDetails = async (req, res) => {
  try {
    const user = await User.find({});

    const users = user.map((u) => ({
      username: u.username,
      level: u.level,
      totalPlayerKills: u.totalPlayerKills,
      guild: u.guild,
    }));

    res.json(users);
  } catch (err) {
    res.send(err);
  }
};

export const getUserByToken = async (req, res) => {
  try {
    const user = await User.findOne({ firebase_token: req.params.token });
    res.json(user);
  } catch (err) {
    res.send(err);
  }
};

export const updateUser = async (req, res) => {
  let data = req.body;
  //let currentUser = User.findOne({firebase_token: req.params.token});
  // if the data sent is a message then just update the message,
  // otherwise update the value!
  const update =
    data.messages != null ? { $push: { profileMessages: data.messages } } : data;
  try {
    const user = await User.findOneAndUpdate(
      { firebase_token: req.params.token },
      update,
      { returnDocument: "after" },
    );
    res.json(user);
  } catch (err) {
    res.send(err);
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.deleteOne({ firebase_token: req.params.token });
    res.json({ message: "Successfully deleted contact" });
  } catch (err) {
    res.send(err);
  }
};
