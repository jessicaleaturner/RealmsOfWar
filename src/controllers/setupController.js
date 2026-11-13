import mongoose from "mongoose";
import { QuestSchema } from "../models/questModel.js";
const Quest = mongoose.model("Quest", QuestSchema);

import quests from "../data/defaultQuests.json" with { type: "json" };
import items from "../data/defaultItems.json" with { type: "json" };
import units from "../data/defaultUnits.json" with { type: "json" };

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
