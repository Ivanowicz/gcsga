import { ActorGURPS, Prereq } from "@module/config"
import { ActorType, NumberCompare, NumberComparison, PrereqType } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { extractTechLevel, LocalizeGURPS, numberCompare } from "@util"
import { BasePrereq, PrereqConstructionContext } from "./base"

export class PrereqList extends BasePrereq {
	prereqs!: Prereq[]

	all!: boolean

	when_tl!: NumberCompare

	constructor(data?: PrereqList | any, context: PrereqConstructionContext = {}) {
		data = mergeObject(PrereqList.defaults, data)
		super(data, context)
		if ((data as PrereqList).prereqs) {
			const list = (data as PrereqList).prereqs
			this.prereqs = []
			for (const e of list) {
				const PrereqConstructor = CONFIG.GURPS.Prereq.classes[e.type as PrereqType]
				if (PrereqConstructor) this.prereqs.push(new PrereqConstructor(e as any, context))
			}
		}
	}

	static get defaults(): Record<string, any> {
		return {
			type: "prereq_list",
			prereqs: [],
			all: true,
			when_tl: { compare: NumberComparison.None },
		}
	}

	// Override satisfied(character: CharacterGURPS, exclude: any, buffer: TooltipGURPS: string): boolean {
	satisfied(actor: ActorGURPS, exclude: any, tooltip: TooltipGURPS): [boolean, boolean] {
		if (actor.type !== ActorType.Character) return [true, false]
		if (this.when_tl?.compare !== "none") {
			let tl = extractTechLevel((actor as any).profile?.tech_level)
			if (tl < 0) tl = 0
			if (!numberCompare(tl, this.when_tl)) return [true, false]
		}
		let count = 0
		let eqpPenalty = false
		const local = new TooltipGURPS()
		if (this.prereqs.length)
			for (const p of this.prereqs) {
				const ps = (p as any).satisfied(actor, exclude, local)
				if (ps[0]) count++
				eqpPenalty = eqpPenalty || ps[1]
			}
		const satisfied = count === this.prereqs.length || (!this.all && count > 0)
		if (!satisfied) {
			if (this.all) tooltip.push(LocalizeGURPS.translations.gurps.prereqs.requires_all)
			else tooltip.push(LocalizeGURPS.translations.gurps.prereqs.requires_one)

			tooltip.push(local)
		}
		return [satisfied, eqpPenalty]
	}
}
