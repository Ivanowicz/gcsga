import { CharacterGURPS } from "@actor"
import { gid, NumberCompare, NumberComparison, PrereqType } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { i18n, numberCompare } from "@util"
import { BasePrereq, PrereqConstructionContext } from "./base"

export class AttributePrereq extends BasePrereq {
	constructor(data: AttributePrereq, context: PrereqConstructionContext = {}) {
		super(data, context)
		Object.assign(this, mergeObject(AttributePrereq.defaults, data))
	}

	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: PrereqType.Attribute,
			which: gid.Strength,
			combined_with: "",
			qualifier: { compare: NumberComparison.AtLeast, qualifier: 10 },
		})
	}

	satisfied(character: CharacterGURPS, _: any, tooltip: TooltipGURPS, prefix: string): [boolean, boolean] {
		let value = character.resolveAttributeCurrent(this.which)
		if (this.combined_with !== "") value += character.resolveAttributeCurrent(this.combined_with)
		let satisfied = numberCompare(value, this.qualifier)
		if (!this.has) satisfied = !satisfied
		if (!satisfied) {
			tooltip.push(prefix)
			tooltip.push(i18n(`gurps.prerqs.has.${this.has}`))
			tooltip.push(" ")
			tooltip.push(character.resolveAttributeName(this.which))
			if (this.combined_with !== "") {
				tooltip.push(i18n("gurps.prereqs.attribute.plus"))
				tooltip.push(character.resolveAttributeName(this.combined_with))
			}
			tooltip.push(i18n("gurps.prereqs.attribute.which"))
			tooltip.push(i18n(`gurps.prereqs.criteria.${this.qualifier?.compare}`))
			tooltip.push((this.qualifier ? this.qualifier.qualifier : 0).toString())
		}
		return [satisfied, false]
	}
}

export interface AttributePrereq extends BasePrereq {
	which: string
	combined_with: string
	qualifier: NumberCompare
}
