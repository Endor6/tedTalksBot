import { SpeakerSession } from "./types";
import { MessageFactory, Activity, CardFactory, Attachment } from "botbuilder";
import { s } from "metronical.proto";

export function createCarousel(
  data: SpeakerSession[],
  topIntent: string
): Partial<Activity> {
  const heroCards = [];
  for (let i = 0; i < data.length; i++) {
    heroCards.push(createHeroCard(data[i], topIntent));
  }
  return MessageFactory.carousel(heroCards);
}

export function createHeroCard(
  data: SpeakerSession,
  topIntent: string
): Attachment {
  const images: string[] = [];
  if (data.images != null && data.images.length > 0) {
    for (let i = 0; i < data.images.length; i++) {
      images.push(data.images[i].link);
    }
  }
  let title: string;
  let subtitle: string;
  const text: string = s(data.description)
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
    //console.log(`AM- NO WAY TO HANDLE ${top}`);
    //context.sendActivity(`No way to handle ${top}`);
  }
  return CardFactory.heroCard(
    title,
    CardFactory.images(images),
    CardFactory.actions([
      {
        type: "openUrl",
        title: "View presentation...",
        value: data.link
      }
    ]),
    {
      subtitle: subtitle,
      text: text
    }
  );
}
