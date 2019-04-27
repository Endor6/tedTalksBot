import { TurnContext, ConversationState, ActivityTypes } from "botbuilder";
import { QnAMaker, LuisRecognizer } from "botbuilder-ai";
import { DialogSet } from "botbuilder-dialogs";
import { SpeakerSession } from "./types";
import { getData } from "./parser";
import { createCarousel, createHeroCard } from "./cards";

export class ConfBot {
  private _qnaMaker: QnAMaker;
  private _luis: LuisRecognizer;
  private _dialogs: DialogSet;
  private _conversationState: ConversationState;

  constructor(
    qnaMaker: QnAMaker,
    luis: LuisRecognizer,
    dialogs: DialogSet,
    conversationState: ConversationState
  ) {
    this._qnaMaker = qnaMaker;
    this._luis = luis;
    this._dialogs = dialogs;
    this._conversationState = conversationState;
  }

  async onTurn(context: TurnContext) {
    const dc = await this._dialogs.createContext(context);

    if (context.activity.type === ActivityTypes.Message) {
      const results = await this._luis.recognize(context);
      const top = LuisRecognizer.topIntent(results);
      const data: SpeakerSession[] = getData(results.entities);

      // The hollowTerms work in unison with the QnAMaker responses
      // to respond to them as a reply, but to ignore them
      // as part of a sentence.
      const hollowTerms = [
        "ok",
        "okay",
        "sorry",
        "well",
        "hmm",
        "hmmm",
        "uh",
        "uhh",
        "cool",
        "awesome",
        "nice",
        "yes",
        "yeah",
        "yup",
        "indeed",
        "yep",
        "also",
        "sweet",
        "please",
        "great",
        "super",
        "really",
        "alright",
        "thanks",
        "very",
        "!"
      ];

      // Skype uses "&apos;" rather than a normal apostrophe like WebChat
      // This breaks QnAMaker's ability to recognize an apostrophy in Skype
      let text = context.activity.text.toLowerCase();
      if (text.indexOf("&apos;") != -1) {
        text = text.replace("&apos;", "'");
      }

      let converted = text;
      let qnaResults = [];
      for (let i = 0; i < hollowTerms.length; i++) {
        if (text != hollowTerms[i] && text.indexOf(hollowTerms[i]) != -1) {
          converted = text.replace(hollowTerms[i], "");
        }
      }

      if (!(converted === " " || converted === ", ")) {
        qnaResults = await this._qnaMaker.generateAnswer(converted);
      } else {
        qnaResults = await this._qnaMaker.generateAnswer(text);
      }

      // console.log(`TOPINTENT: ${top}`);
      // console.log(`RESULTS.ENTITIES: ${data.length}`);

      if (qnaResults.length > 0 && qnaResults[0].score > 0.8) {
        await context.sendActivity(qnaResults[0].answer);
      } else if (data.length > 1) {
        await context.sendActivity(createCarousel(data, top));
      } else if (data.length === 1) {
        await context.sendActivity({
          attachments: [createHeroCard(data[0], top)]
        });
      } else if (data.length === 0) {
        await context.sendActivity(
          `I'm sorry, I am not able to reference that request. Can you please try rewording your question?`
        );
      }
      await this._conversationState.saveChanges(context);
    }
  }
}
