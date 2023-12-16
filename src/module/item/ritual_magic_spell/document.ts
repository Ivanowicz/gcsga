import { ItemGCS } from "@item/gcs"
import { SkillLevel } from "@item/skill/data"
import { Difficulty, gid } from "@module/data"
import { SkillDefault } from "@module/default"
import { TooltipGURPS } from "@module/tooltip"
import { inlineNote, LocalizeGURPS } from "@util"
import { RitualMagicSpellSource } from "./data"

export class RitualMagicSpellGURPS extends ItemGCS<RitualMagicSpellSource> {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: new TooltipGURPS() }

	unsatisfied_reason = ""

	// Getters
	get secondaryText(): string {
		const out: string[] = []
		if (inlineNote(this.actor, "notes_display")) {
			if (this.system.notes.trim()) out.push(this.system.notes)
			if (this.rituals) {
				if (out.length) out.push("<br>")
				out.push(this.rituals)
			}
			if (this.studyHours !== 0) {
				if (out.length) out.push("<br>")
				if (this.studyHours !== 0)
					out.push(
						LocalizeGURPS.format(LocalizeGURPS.translations.gurps.study.studied, {
							hours: this.studyHours,
							total: (this.system as any).study_hours_needed,
						})
					)
			}
			if (inlineNote(this.actor, "skill_level_adj_display")) {
				if (this.level.tooltip.length) {
					if (out.length) out.push("<br>")
					out.push(this.level.tooltip.toString())
				}
			}
		}
		if (out.length) out.push("<br>")
		const values = {
			resist: this.system.resist,
			spell_class: this.system.spell_class,
			casting_cost: this.system.casting_cost,
			maintenance_cost: this.system.maintenance_cost,
			casting_time: this.system.casting_time,
			duration: this.system.duration,
			college: this.system.college,
		}
		const list = []
		for (const [k, v] of Object.entries(values)) {
			if (v && v !== "-") list.push(`${game.i18n.localize(`gurps.character.spells.${k}`)}: ${v}`)
		}
		out.push(list.join("; "))
		return `<div class="item-notes">${out.join("")}</div>`
	}

	get rituals(): string {
		return ""
	}

	get points(): number {
		return this.system.points
	}

	get techLevel(): string {
		return this.system.tech_level
	}

	get attribute(): string {
		return this.system.difficulty?.split("/")[0] ?? gid.Intelligence
	}

	get difficulty(): string {
		return this.system.difficulty?.split("/")[1] ?? Difficulty.Hard
	}

	get powerSource(): string {
		return this.system.power_source
	}

	get college(): string[] {
		return this.system.college
	}

	get baseSkill(): string {
		return this.system.base_skill
	}

	get prereqCount(): number {
		return this.system.prereq_count
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor) {
			points += this.actor.spellPointBonusesFor(this.name!, this.powerSource, this.college, this.tags, tooltip)
			points = Math.max(points, 0)
		}
		return points
	}

	satisfied(tooltip: TooltipGURPS): boolean {
		if (this.college.length === 0) {
			// Tooltip.push(prefix)
			tooltip.push("gurps.ritual_magic_spell.must_assign_college")
			return false
		}
		for (const c of this.college) {
			if (this.actor?.bestSkillNamed(this.baseSkill, c, false, null)) return true
		}
		if (this.actor?.bestSkillNamed(this.baseSkill, "", false, null)) return true
		// Tooltip.push(prefix)
		tooltip.push("gurps.prereqs.ritual_magic.skill.name")
		tooltip.push(this.baseSkill)
		tooltip.push(` (${this.college[0]})`)
		const colleges = this.college
		colleges.shift()
		for (const c of colleges) {
			tooltip.push("gurps.prereqs.ritual_magic.skill.or")
			tooltip.push(this.baseSkill)
			tooltip.push(`(${c})`)
		}
		return false
	}

	get skillLevel(): string {
		// if (this.calculateLevel().level === -Infinity) return "-"
		// return this.calculateLevel().level.toString()
		if (this.effectiveLevel === -Infinity) return "-"
		return this.effectiveLevel.toString()
	}

	get relativeLevel(): string {
		if (this.calculateLevel().level === -Infinity) return "-"
		return (
			(this.actor?.attributes?.get(this.attribute)?.attribute_def.name ?? "") +
			this.calculateLevel().relative_level.signedString()
		)
	}

	// Point & Level Manipulation
	updateLevel(): boolean {
		const saved = this.level
		this.level = this.calculateLevel()
		return saved !== this.level
	}

	get effectiveLevel(): number {
		if (!this.actor) return -Infinity
		let att = this.actor.resolveAttributeCurrent(this.attribute)
		let effectiveAtt = this.actor.resolveAttributeEffective(this.attribute)
		return this.calculateLevel().level - att + effectiveAtt
	}

	calculateLevel(): SkillLevel {
		let skillLevel: SkillLevel = {
			level: -Infinity,
			relative_level: 0,
			tooltip: new TooltipGURPS(),
		}
		if (this.college.length === 0) skillLevel = this.determineLevelForCollege("")
		else {
			for (const c of this.college) {
				const possible = this.determineLevelForCollege(c)
				if (skillLevel.level < possible.level) skillLevel = possible
			}
		}
		if (this.actor) {
			const tooltip = new TooltipGURPS()
			tooltip.push(skillLevel.tooltip)
			let levels = Math.trunc(
				this.actor.spellBonusFor(this.name!, this.powerSource, this.college, this.tags, tooltip)
			)
			skillLevel.level += levels
			skillLevel.relative_level += levels
			skillLevel.tooltip = tooltip
		}
		return {
			level: skillLevel.level,
			relative_level: skillLevel.relative_level,
			tooltip: skillLevel.tooltip,
		}
	}

	determineLevelForCollege(college: string): SkillLevel {
		const def = new SkillDefault({
			type: gid.Skill,
			name: this.baseSkill,
			specialization: college,
			modifier: -this.prereqCount,
		})
		if (college === "") def.name = ""
		const limit = 0
		const skillLevel = this.calculateLevelAsTechnique(def, college, limit)
		skillLevel.relative_level += def.modifier
		def.specialization = ""
		def.modifier -= 6
		const fallback = this.calculateLevelAsTechnique(def, college, limit)
		fallback.relative_level += def.modifier
		if (skillLevel.level >= def.modifier) return skillLevel
		return fallback
	}

	calculateLevelAsTechnique(def: SkillDefault, college: string, limit: number): SkillLevel {
		const tooltip = new TooltipGURPS()
		let relative_level = 0
		let points = this.adjustedPoints()
		let level = -Infinity
		if (this.actor) {
			if (def?.type === gid.Skill) {
				const sk = this.actor.baseSkill(def!, true)
				if (sk) level = sk.calculateLevel.level
			} else if (def) {
				level = (def?.skillLevelFast(this.actor, true, null, false) || 0) - (def?.modifier || 0)
			}
			if (level !== -Infinity) {
				const base_level = level
				level += def!.modifier // ?
				if (this.difficulty === "h") points -= 1
				if (points > 0) relative_level = points
				if (level !== -Infinity) {
					// Relative_level += this.actor.bonusFor(`skill.name/${this.name}`, tooltip)
					relative_level += this.actor.skillBonusFor(this.name!, college, this.tags, tooltip)
					level += relative_level
				}
				if (limit) {
					const max = base_level + limit
					if (level > max) {
						relative_level -= level - max
						level = max
					}
				}
			}
		}
		return {
			level: level,
			relative_level: relative_level,
			tooltip: tooltip,
		}
	}

	incrementSkillLevel() {
		const basePoints = this.points + 1
		let maxPoints = basePoints
		if (this.difficulty === Difficulty.Wildcard) maxPoints += 12
		else maxPoints += 4

		const oldLevel = this.calculateLevel().level
		for (let points = basePoints; points < maxPoints; points++) {
			this.system.points = points
			if (this.calculateLevel().level > oldLevel) {
				return this.update({ "system.points": points })
			}
		}
	}

	decrementSkillLevel() {
		if (this.points <= 0) return
		const basePoints = this.points
		let minPoints = basePoints
		if (this.difficulty === Difficulty.Wildcard) minPoints -= 12
		else minPoints -= 4
		minPoints = Math.max(minPoints, 0)

		let oldLevel = this.calculateLevel().level
		for (let points = basePoints; points >= minPoints; points--) {
			this.system.points = points
			if (this.calculateLevel().level < oldLevel) {
				break
			}
		}

		if (this.points > 0) {
			let oldLevel = this.calculateLevel().level
			while (this.points > 0) {
				this.system.points = Math.max(this.points - 1, 0)
				if (this.calculateLevel().level !== oldLevel) {
					this.system.points++
					return this.update({ "system.points": this.points })
				}
			}
		}
	}
}
