import Mustache from "mustache";
import { getFirstNum, getFirstNumOrDefault } from "../common/common";

export class Skills {
    skillSet = new SkillSet();

    public toString(): string {
        return `<Skills activeSkillSet="1">
${this.skillSet}
</Skills>`;
    }
}

export class SkillSet {
    skills: Skill[] = [];
    public toString(): string {
        const tmpl = `<SkillSet id="1">
{{#skills}}
{{toString}}
{{/skills}}
</SkillSet>`;
        return Mustache.render(tmpl, this);
    }
}

// 1. skills only depend on link, two active gems can be in one skill
// 2. vaal gem treats as one gem
// 3. computed gem(like Arcanist Brand) treats as one gem
export class Skill {
    slot = "";
    gems: Gem[] = [];

    constructor(slotName: string, json: any[]) {
        this.slot = slotName;
        for (const gemJson of json) {
            this.gems.push(new Gem(gemJson));
        }
    }

    public toString(): string {
        const tmpl = `<Skill enabled="true" slot="{{slot}}" mainActiveSkill="nil">
{{#gems}}
{{.}}
{{/gems}}
</Skill>`;
        return Mustache.render(tmpl, this);
    }
}

export class Gem {
    level = 20;
    qualityId = "Default";
    quality = 0;
    nameSpec = "";

    constructor(json: any) {
        const propMap = new Map<string, any>();
        if (json.properties) {
            (json.properties as any[]).forEach((prop) => propMap.set(prop.name, prop));
        }
        this.level = getFirstNumOrDefault(propMap.get("Level")?.values[0][0], 20);
        this.quality = getFirstNumOrDefault(propMap.get("Quality")?.values[0][0], 0);
        this.nameSpec = json.baseType.replace(" Support", "");

        const matched = json.typeLine.match(ALT_MATCHER);
        if (matched) {
            this.qualityId = ALTERNATE_MAP[matched[0]];
        }
    }

    public toString(): string {
        const tmpl = `<Gem level="{{level}}" qualityId="{{qualityId}}" quality="{{quality}}" enabled="true" nameSpec="{{nameSpec}}"/>`;
        return Mustache.render(tmpl, this);
    }
}

const ALTERNATE_MAP: { [key: string]: string } = {
    "Anomalous ": "Alternate1",
    "Divergent ": "Alternate2",
    "Phantasmal ": "Alternate3",
};

const ALT_MATCHER = new RegExp(`^${Object.getOwnPropertyNames(ALTERNATE_MAP).join("|")}`);
