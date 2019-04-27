"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const cheerio_1 = require("cheerio");
const file = fs.readFileSync("./data/tedTalks2019.xml", "utf-8");
const xml = cheerio_1.load(file);
function getData(entities) {
    if (entities != null) {
        let subject = entities["subject"];
        let location = entities["location"];
        let person = entities["person"];
        let classification = entities["classification"];
        let topic = entities["topic"];
        if (person != null) {
            return getSessionByPerson(person instanceof Array ? person[0] : person);
        }
        if (subject != null) {
            console.log("got to subject!");
            subject = subject.toString();
            return getSessionBySubject(subject instanceof Array ? subject[0] : subject);
        }
        if (topic != null) {
            subject = subject.toString();
            return getSessionByTopic(topic instanceof Array ? topic[0] : topic);
        }
        if (classification != null) {
            classification = classification.toString();
            return getSessionByClassification(classification instanceof Array ? classification[0] : classification);
        }
        if (location != null) {
            return getSessionByLocation(location instanceof Array ? location[0] : location);
        }
    }
    return [];
}
exports.getData = getData;
function getExact(t) {
    var e = writeEvent(getEventNodes("title", t));
    return e.length > 0 ? e[0] : null;
}
exports.getExact = getExact;
function getSessionBySubject(subject) {
    return writeEvent(getEventNodes("keywords", subject).concat(getEventNodes("title", subject)));
}
function getSessionByLocation(location, data) {
    return writeEvent(getEventNodes("location", location));
}
function getSessionByPerson(person, data) {
    return writeEvent(getEventNodes("speakers", person));
}
function getSessionByClassification(classification, data) {
    return writeEvent(getEventNodes("classification", classification));
}
function getSessionByTopic(topic, data) {
    return writeEvent(getEventNodes("title", topic));
}
function getEventNodes(s, t) {
    var events = [];
    xml(s).each((idx, elem) => {
        if (xml(elem)
            .text()
            .toLowerCase()
            .indexOf(t.toLowerCase()) > -1) {
            events.push(elem.parent);
        }
    });
    return events;
}
function writeEvent(events) {
    var results = [];
    for (let i = 0; i < events.length; i++) {
        let elem = xml(events[i]);
        let r = {
            date: elem.parent().attr("date"),
            startTime: elem.attr("start-time"),
            endTime: elem.attr("end-time"),
            title: elem.find("title").text(),
            classification: elem.find("classification").text(),
            description: elem.find("description").text(),
            speakers: elem.find("speakers").text(),
            location: elem.find("location").text(),
            keywords: elem.find("keywords").text(),
            link: elem.find("page").text(),
            type: elem.attr("type")
        };
        let img = elem.find("photo");
        if (img != null) {
            let imgs = [];
            img.each((idx, el) => {
                imgs.push({
                    type: xml(el).attr("type"),
                    link: xml(el).text()
                });
            });
            r.images = imgs;
        }
        results.push(r);
    }
    return results;
}
//# sourceMappingURL=parser.js.map