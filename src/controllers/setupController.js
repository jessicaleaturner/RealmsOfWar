import mongoose from "mongoose";
import { QuestSchema } from "../models/questModel.js";
const Quest = mongoose.model("Quest", QuestSchema);

import quests from "../data/defaultQuests.js";
// TODO: unit/ items routes
// TODO: unit/ items controllers
// TODO: import unit/ items controllers
import items from "../data/defaultItems.js";
import units from "../data/defaultUnits.js  ";

const setupDatabase = () => {
  addNewQuest(quests);
};

const addNewQuest = (data) => {
  for (var i = 0; i < data.length; i++) {
    let newQuest = new Quest(data[i]);
    Quest.findOne({ id: data[i].id }, (err, quest) => {
      if (!quest) {
        newQuest.save((err, quest) => {
          if (err) {
            console.log(err);
          }
          console.log(quest);
        });
      }
      if (err) {
        console.log(err);
      }
      console.log(quest);
    });
  }
};

export default setupDatabase;
