import { BonusOwner } from "./bonus-owner.ts"
import { StringCompareType, StringCriteria } from "@util/string-criteria.ts"
import { LeveledAmount } from "./leveled-amount.ts"
import { SpellBonusObj } from "./data.ts"
import { feature, spellmatch } from "@util"

export class SpellBonus extends BonusOwner<feature.Type.SpellBonus> {
	match: spellmatch.Type

	name: StringCriteria

	tags: StringCriteria

	constructor() {
		super(feature.Type.SpellBonus)
		this.match = spellmatch.Type.AllColleges
		this.name = new StringCriteria({ compare: StringCompareType.IsString })
		this.tags = new StringCriteria({ compare: StringCompareType.AnyString })
		this.leveledAmount = new LeveledAmount({ amount: 1 })
	}

	matchForType(name: string, powerSource: string, colleges: string[]): boolean {
		return spellmatch.Type.matchForType(this.match, this.name, name, powerSource, colleges)
	}

	override toObject(): SpellBonusObj {
		return {
			...super.toObject(),
			match: this.match,
			name: this.name,
			tags: this.tags,
		}
	}

	static fromObject(data: SpellBonusObj): SpellBonus {
		const bonus = new SpellBonus()
		bonus.match = data.match
		if (data.name) bonus.name = new StringCriteria(data.name)
		if (data.tags) bonus.tags = new StringCriteria(data.tags)
		bonus.leveledAmount = LeveledAmount.fromObject(data)
		return bonus
	}
}