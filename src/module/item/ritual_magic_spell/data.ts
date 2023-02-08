import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Weapon } from "@module/config"
import { Difficulty, ItemType, Study } from "@module/data"
import { PrereqList } from "@prereq"

export type RitualMagicSpellSource = ItemGCSSource<ItemType.RitualMagicSpell, RitualMagicSpellSystemData>

// Export class RitualMagicSpellData extends BaseItemDataGURPS<RitualMagicSpellGURPS> {}

export interface RitualMagicSpellData extends Omit<RitualMagicSpellSource, "effects">, RitualMagicSpellSystemData {
	readonly type: RitualMagicSpellSource["type"]
	data: RitualMagicSpellSystemData

	readonly _source: RitualMagicSpellSource
}

export interface RitualMagicSpellSystemData extends ItemGCSSystemData {
	prereqs: PrereqList
	difficulty: Difficulty
	tech_level: string
	tech_level_required: boolean
	college: Array<string>
	power_source: string
	spell_class: string
	resist: string
	casting_cost: string
	maintenance_cost: string
	casting_time: string
	duration: string
	points: number
	weapons: Weapon[]
	// Calc: {
	// 	level: number;
	// 	rsl: string;
	// };
	base_skill: string
	prereq_count: number
	study: Study[]
}
