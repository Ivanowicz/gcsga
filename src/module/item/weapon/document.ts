import { SkillBonus } from "@feature"
import { BaseItemGURPS } from "@item/base"
import { ContainerGURPS } from "@item/container"
import { Feature } from "@module/config"
import { ActorType, gid, ItemType } from "@module/data"
import { SkillDefault } from "@module/default"
import { TooltipGURPS } from "@module/tooltip"
import { LocalizeGURPS, stringCompare } from "@util"
import { HandlebarsHelpersGURPS } from "@util/handlebars_helpers"
import { WeaponDamage } from "./damage"
import { BaseWeaponSystemData } from "./data"

class BaseWeaponGURPS extends BaseItemGURPS {
	get itemName(): string {
		if (this.container instanceof Item) return this.container?.name ?? ""
		return ""
	}

	get usage(): string {
		return this.system.usage
	}

	get strength(): string {
		return this.system.strength
	}

	override get actor(): (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null {
		const actor = super.actor
		if (actor?.type === ActorType.Character) return actor
		return null
	}

	get notes(): string {
		let outString = '<div class="item-notes">'
		if (this.container) {
			outString += HandlebarsHelpersGURPS.format((this.container as any).notes)
			if (this.system.usage_notes) outString += "<br>"
		}
		if (this.system.usage_notes) outString += HandlebarsHelpersGURPS.format(this.system.usage_notes)
		outString += "</div>"
		return outString
	}

	get level(): number {
		return this.skillLevel()
	}

	get equipped(): boolean {
		if (!this.actor) return false
		if ([ItemType.Equipment, ItemType.EquipmentContainer].includes((this.container as any)?.type))
			return (this.container as any).equipped
		if ([ItemType.Trait, ItemType.TraitContainer].includes((this.container as any)?.type))
			return (this.container as any).enabled
		return true
	}

	get defaults(): SkillDefault[] {
		if (this.system.hasOwnProperty("defaults")) {
			const defaults: SkillDefault[] = []
			const list = (this.system as any).defaults
			for (const f of list ?? []) {
				defaults.push(new SkillDefault(f))
			}
			return defaults
		}
		return []
	}

	skillLevel(tooltip?: TooltipGURPS): number {
		const actor = this.actor
		if (!actor) return 0
		let primaryTooltip = new TooltipGURPS()
		if (tooltip) primaryTooltip = tooltip
		const adj =
			this.skillLevelBaseAdjustment(actor, primaryTooltip) + this.skillLevelPostAdjustment(actor, primaryTooltip)
		let best = -Infinity
		for (const def of this.defaults) {
			let level = def.skillLevelFast(actor, false, null, true)
			if (level !== -Infinity) {
				level += adj
				if (best < level) best = level
			}
		}
		if (best === -Infinity) return 0
		if (tooltip && primaryTooltip && primaryTooltip.length !== 0) {
			if (tooltip.length !== 0) tooltip.push("\n")
			tooltip.push(primaryTooltip)
		}
		if (best < 0) best = 0
		return best
	}

	skillLevelBaseAdjustment(actor: this["actor"], tooltip: TooltipGURPS): number {
		let adj = 0
		if (!(this.container instanceof ContainerGURPS)) return 0
		const minST = this.resolvedMinimumStrength - (actor.strengthOrZero + actor.striking_st_bonus)
		if (minST > 0) adj -= minST
		const nameQualifier = this.container?.name
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			(this.container as any)?.tags,
			tooltip
		)) {
			adj += bonus.adjustedAmount
		}
		for (const bonus of actor.namedWeaponSkillBonusesFor(
			nameQualifier!,
			this.usage,
			(this.container as any)?.tags,
			tooltip
		)) {
			adj += bonus.adjustedAmount
		}
		if (this.container)
			for (const f of (this.container as any).features) {
				adj += this.extractSkillBonusForThisWeapon(f, tooltip)
			}
		if ([ItemType.Trait, ItemType.Equipment, ItemType.EquipmentContainer].includes(this.container?.type as any)) {
			for (const mod of (this.container as any).modifiers) {
				for (const f of mod.features) {
					adj += this.extractSkillBonusForThisWeapon(f, tooltip)
				}
			}
		}
		return adj
	}

	skillLevelPostAdjustment(actor: this["actor"], tooltip: TooltipGURPS): number {
		if (this.type === ItemType.MeleeWeapon)
			if ((this.system as any).parry?.includes("F")) return this.encumbrancePenalty(actor, tooltip)
		return 0
	}

	encumbrancePenalty(actor: this["actor"], tooltip: TooltipGURPS): number {
		if (!actor) return 0
		const penalty = actor.encumbranceLevel(true).penalty
		if (penalty !== 0 && tooltip) {
			tooltip.push("\n")
			tooltip.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.tooltip.encumbrance, {
					bonus: penalty.signedString(),
				})
			)
		}
		return penalty
	}

	extractSkillBonusForThisWeapon(f: Feature, tooltip: TooltipGURPS): number {
		if (f instanceof SkillBonus) {
			if (f.selection_type === "this_weapon") {
				if (stringCompare(this.usage, f.specialization)) {
					f.addToTooltip(tooltip)
					return f.adjustedAmount
				}
			}
		}
		return 0
	}

	get resolvedMinimumStrength(): number {
		let started = false
		let value = 0
		for (const ch of this.system.strength) {
			if (ch.match(/[0-9]/)) {
				value *= 10
				value += parseInt(ch)
				started = true
			} else if (started) break
		}
		return value
	}

	get fastResolvedDamage(): string {
		return this.damage.resolvedDamage()
	}

	get damage(): WeaponDamage {
		return new WeaponDamage({ ...this.system.damage, parent: this })
	}

	resolvedValue(input: string, baseDefaultType: string, tooltip?: TooltipGURPS): string {
		const actor = this.actor
		input ??= ""
		input = input.trim()
		if (!input.match(/^[+-]?[0-9]+/)) return input
		if (!actor) return input
		let skillLevel = -Infinity
		let modifier = parseInt(input) || 0
		const re = new RegExp(`^${modifier >= 0 ? "\\+?" : ""}${modifier}`)
		let buffer = input.replace(re, "")
		while (skillLevel === -Infinity) {
			let primaryTooltip = new TooltipGURPS()
			let secondaryTooltip = new TooltipGURPS()
			let preAdj = this.skillLevelBaseAdjustment(actor, primaryTooltip)
			let postAdj = this.skillLevelPostAdjustment(actor, primaryTooltip)
			let adj = 3
			if (baseDefaultType === gid.Parry) adj += this.actor.parryBonus
			else adj += this.actor.blockBonus
			let best = -Infinity
			for (const def of this.defaults) {
				let level = def.skillLevelFast(actor, false, null, true)
				if (level === -Infinity) continue
				level += preAdj
				if (baseDefaultType !== def.type) level = Math.trunc(level / 2 + adj)
				level += postAdj
				let possibleTooltip = new TooltipGURPS()
				// TODO: localization
				if (def.type === gid.Skill && def.name === "Karate")
					level += this.encumbrancePenalty(actor, possibleTooltip)
				if (best < level) {
					best = level
					secondaryTooltip = possibleTooltip
				}
			}
			if (best !== -Infinity && tooltip) {
				if (primaryTooltip && primaryTooltip.length !== 0) {
					if (tooltip.length !== 0) tooltip.push("\n")
					tooltip.push(primaryTooltip)
				}
				if (secondaryTooltip && secondaryTooltip.length !== 0) {
					if (tooltip.length !== 0) tooltip.push("\n")
					tooltip.push(secondaryTooltip)
				}
			}
			skillLevel = Math.max(best, 0)
		}
		const num = String(Math.trunc(skillLevel + modifier))
		buffer = num + buffer
		return buffer
	}

	exportSystemData(_keepOther: boolean): any {
		const system = this.system
		console.log(system)
		// system.damage.base = new DiceGURPS(this.damage.base).toString(false)
		// system.damage.fragmentation = new DiceGURPS(this.damage.fragmentation).toString(false)
		return system
	}
}

interface BaseWeaponGURPS extends BaseItemGURPS {
	readonly system: BaseWeaponSystemData
}

export { BaseWeaponGURPS }
