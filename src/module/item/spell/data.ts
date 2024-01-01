import { ItemGCSCalcValues, ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Difficulty, ItemType, Study, StudyHoursNeeded } from "@module/data"
import { PrereqList } from "@prereq"

export type SpellSource = ItemGCSSource<ItemType.Spell, SpellSystemData>

// Export class SpellData extends BaseItemDataGURPS<SpellGURPS> {}

export interface SpellData extends Omit<SpellSource, "effects">, SpellSystemData {
	readonly type: SpellSource["type"]
	data: SpellSystemData

	readonly _source: SpellSource
}

export interface SpellSystemData extends ItemGCSSystemData {
	prereqs: PrereqList
	difficulty: `${string}/${Difficulty}`
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
	study: Study[]
	study_hours_needed: StudyHoursNeeded
	calc?: SpellCalcValues
}

export interface SpellCalcValues extends ItemGCSCalcValues {
	level: number
	rsl: string
	points?: number
}
