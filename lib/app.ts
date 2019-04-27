import {
  BotFrameworkAdapter,
  ConversationState,
  MemoryStorage
} from "botbuilder";
import * as restify from "restify";
import { ConfBot } from "./bot";
import { QnAMaker, LuisRecognizer } from "botbuilder-ai";
import { DialogSet } from "botbuilder-dialogs";
import {
  IQnAService,
  ILuisService,
  BotConfiguration
} from "botframework-config";
import { config } from "dotenv";

config();

const conversationState = new ConversationState(new MemoryStorage());

const dialogs = new DialogSet(conversationState.createProperty("dialogState"));

const botConfig = BotConfiguration.loadSync(
  "./tt-2019.bot",
  process.env.BOT_FILE_SECRET
);

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`${server.name} listening on ${server.url}`);
});

const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

const qnaMaker = new QnAMaker({
  knowledgeBaseId: (<IQnAService>(
    botConfig.findServiceByNameOrId("qnaTedTalks03-kb")
  )).kbId,
  endpointKey: (<IQnAService>(
    botConfig.findServiceByNameOrId("qnaTedTalks03-kb")
  )).endpointKey,
  host: (<IQnAService>botConfig.findServiceByNameOrId("qnaTedTalks03-kb"))
    .hostname
});

const luis = new LuisRecognizer({
  applicationId: (<ILuisService>botConfig.findServiceByNameOrId("tedTalks2019"))
    .appId,
  endpointKey: (<ILuisService>botConfig.findServiceByNameOrId("tedTalks2019"))
    .subscriptionKey,
  endpoint: (<ILuisService>(
    botConfig.findServiceByNameOrId("tedTalks2019")
  )).getEndpoint()
});

const echo: ConfBot = new ConfBot(qnaMaker, luis, dialogs, conversationState);

server.post("/api/messages", (req, res) => {
  adapter.processActivity(req, res, async context => {
    await echo.onTurn(context);
  });
});
