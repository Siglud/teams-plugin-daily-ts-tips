import { AzureFunction, Context } from "@azure/functions";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import notificationTemplate from "./adaptiveCards/notification-default.json";
import { CardData } from "./cardModels";
import { bot } from "./internal/initialize";
import fs from 'fs'

const content = fs.readFileSync('./content/content.txt', 'utf8').split('\n\n');
const totalLine = content.length;
// test only
var globalCounter = 0;


// Time trigger to send notification. You can change the schedule in ../timerNotifyTrigger/function.json
const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  // const now = new Date();
  // const line = Math.floor(now.getTime() / 8.64e7) % totalLine;
  // test only
  // const line = globalCounter++ % totalLine;
  const line = totalLine - 1;
  for (const target of await bot.notification.installations()) {
    await target.sendAdaptiveCard(
      AdaptiveCards.declare<CardData>(notificationTemplate).render({
        title: "TypeScript Daily Tips!",
        description: content[line]
      })
    );
  }

  /****** To distinguish different target types ******/
  /** "Channel" means this bot is installed to a Team (default to notify General channel)
  if (target.type === "Channel") {
    // Directly notify the Team (to the default General channel)
    await target.sendAdaptiveCard(...);

    // List all channels in the Team then notify each channel
    const channels = await target.channels();
    for (const channel of channels) {
      await channel.sendAdaptiveCard(...);
    }

    // List all members in the Team then notify each member
    const members = await target.members();
    for (const member of members) {
      await member.sendAdaptiveCard(...);
    }
  }
  **/

  /** "Group" means this bot is installed to a Group Chat
  if (target.type === "Group") {
    // Directly notify the Group Chat
    await target.sendAdaptiveCard(...);

    // List all members in the Group Chat then notify each member
    const members = await target.members();
    for (const member of members) {
      await member.sendAdaptiveCard(...);
    }
  }
  **/

  /** "Person" means this bot is installed as a Personal app
  if (target.type === "Person") {
    // Directly notify the individual person
    await target.sendAdaptiveCard(...);
  }
  **/
};

export default timerTrigger;
