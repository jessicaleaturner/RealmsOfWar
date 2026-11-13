import mongoose from "mongoose";
import { QuestSchema } from "../models/questModel.js";
// default collection name defined by Mongoose is lower-cased, pluralised model name
// ie 'Quest' becomes quests
const Quest = mongoose.model("Quest", QuestSchema);

export const getQuests = async (req, res) => {
  try {
    const quests = await Quest.find({});
    res.json(quests);
  } catch (err) {
    res.send(err);
  }
};

export const getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findOne({ id: req.params.id });
    res.json(quest);
  } catch (err) {
    res.send(err);
  }
};

// admin only route to create new quests
export const addNewQuest = async (req, res) => {
  try {
    // only add the quest if one with this id doesn't exist yet
    const existing = await Quest.findOne({ id: req.body.id });
    if (existing) {
      return res.json({ message: "Quest already exists!" });
    }
    const quest = await new Quest(req.body).save();
    res.json(quest);
  } catch (err) {
    res.send(err);
  }
};

//admin only route to update quests
export const updateQuest = async (req, res) => {
  try {
    const quest = await Quest.findOneAndUpdate({ id: req.params.id }, req.body, {
      returnDocument: "after",
    });
    res.json(quest);
  } catch (err) {
    res.send(err);
  }
};

//admin only route to delete quests
export const deleteQuest = async (req, res) => {
  try {
    await Quest.deleteOne({ id: req.params.id });
    res.json({ message: "Successfully deleted contact" });
  } catch (err) {
    res.send(err);
  }
};
