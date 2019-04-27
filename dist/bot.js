"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_ai_1 = require("botbuilder-ai");
const parser_1 = require("./parser");
const cards_1 = require("./cards");
class ConfBot {
    constructor(qnaMaker, luis, dialogs, conversationState) {
        this._qnaMaker = qnaMaker;
        this._luis = luis;
        this._dialogs = dialogs;
        this._conversationState = conversationState;
    }
    onTurn(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const dc = yield this._dialogs.createContext(context);
            if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
                const results = yield this._luis.recognize(context);
                const top = botbuilder_ai_1.LuisRecognizer.topIntent(results);
                const data = parser_1.getData(results.entities);
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
                    "no"
                ];
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
                    qnaResults = yield this._qnaMaker.generateAnswer(converted);
                }
                else {
                    qnaResults = yield this._qnaMaker.generateAnswer(text);
                }
                if (qnaResults.length > 0 && qnaResults[0].score > 0.8) {
                    yield context.sendActivity(qnaResults[0].answer);
                }
                else if (data.length > 1) {
                    yield context.sendActivity(cards_1.createCarousel(data, top));
                }
                else if (data.length === 1) {
                    yield context.sendActivity({
                        attachments: [cards_1.createHeroCard(data[0], top)]
                    });
                }
                else if (data.length === 0) {
                    yield context.sendActivity(`I'm sorry, I am not able to reference that request. Can you please try rewording your question?`);
                }
                yield this._conversationState.saveChanges(context);
            }
        });
    }
}
exports.ConfBot = ConfBot;
//# sourceMappingURL=bot.js.map