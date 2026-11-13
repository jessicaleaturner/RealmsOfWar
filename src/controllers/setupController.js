import mongoose from "mongoose";
import { QuestSchema } from "../models/questModel.js";
const Quest = mongoose.model("Quest", QuestSchema);

import quests from "../data/defaultQuests.json" with { type: "json" };
import items from "../data/defaultItems.json" with { type: "json" };
import units from "../data/defaultUnits.json" with { type: "json" };

const setupDatabase = async () => {
  await addNewQuest(quests);
};

const addNewQuest = async (data) => {
  for (const questData of data) {
    try {
      let quest = await Quest.findOne({ id: questData.id });
      if (!quest) {
        quest = await new Quest(questData).save();
      }
      console.log(quest);
    } catch (err) {
      console.log(err);
    }
  }
};

export default setupDatabase;
