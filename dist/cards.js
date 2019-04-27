"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const metronical_proto_1 = require("metronical.proto");
function createCarousel(data, topIntent) {
    const heroCards = [];
    for (let i = 0; i < data.length; i++) {
        heroCards.push(createHeroCard(data[i], topIntent));
    }
    return botbuilder_1.MessageFactory.carousel(heroCards);
}
exports.createCarousel = createCarousel;
function createHeroCard(data, topIntent) {
    const images = [];
    if (data.images != null && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
            images.push(data.images[i].link);
        }
    }
    let title;
    let subtitle;
    const text = metronical_proto_1.s(data.description)
        .stripHtml()
        .truncateWords(50)
        .toString();
    switch (topIntent.toLowerCase()) {
        case "speaker":
            title = data.speakers;
            subtitle = data.location;
            break;
        case "location":
            title = data.location;
            subtitle = `${data.speakers}, ${data.title}`;
            break;
        case "topic":
            title = data.title;
            subtitle = data.speakers;
            break;
        case "presentation":
            title = data.title;
            subtitle = data.speakers;
            break;
        default:
            throw new Error(`No way to handle ${topIntent}`);
    }
    return botbuilder_1.CardFactory.heroCard(title, botbuilder_1.CardFactory.images(images), botbuilder_1.CardFactory.actions([
        {
            type: "openUrl",
            title: "View presentation...",
            value: data.link
        }
    ]), {
        subtitle: subtitle,
        text: text
    });
}
exports.createHeroCard = createHeroCard;
//# sourceMappingURL=cards.js.map