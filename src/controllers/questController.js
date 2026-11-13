import mongoose from "mongoose";
import { QuestSchema } from "../models/questModel.js";
// default collection name defined by Mongoose is lower-cased, pluralised model name
// ie 'Quest' becomes quests
const Quest = mongoose.model("Quest", QuestSchema);

export const getQuests = (req, res) => {
  Quest.find({}, (err, quest) => {
    if (err) {
      res.send(err);
    }
    res.json(quest);
  });
};

export const getQuestById = (req, res) => {
  Quest.findOne({ id: req.params.id }, (err, quest) => {
    if (err) {
      res.send(err);
    }
    res.json(quest);
  });
};

// admin only route to create new quests
export const addNewQuest = (req, res) => {
  let newQuest = new Quest(req.body);
  newQuest.findOne({ id: req.params.id }, (err, quest) => {
    if (err) {
      newQuest.save((err, quest) => {
        if (err) {
          res.send(err);
        }
        res.json(quest);
      });
      console.log("Quest already exists!");
    }
  });
  // TODO: check to see if it doesnt exist then add to database
  // newQuest.save((err, quest) => {
  //   if(err){
  //     res.send(err);
  //   }
  //   res.json(quest);
  // });
};

//admin only route to update quests
export const updateQuest = (req, res) => {
  Quest.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    { new: true },
    (err, quest) => {
      if (err) {
        res.send(err);
      }
      res.json(quest);
    },
  );
};

//admin only route to delete quests
export const deleteQuest = (req, res) => {
  Quest.remove({ id: req.params.id }, (err, quest) => {
    if (err) {
      res.send(err);
    }
    res.json({ message: "Successfully deleted contact" });
  });
};
