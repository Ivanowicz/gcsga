import { ContainerGURPS } from "@item/container"
import { SkillLevel } from "@item/skill/data"
import { Difficulty, gid } from "@module/data"
import { TooltipGURPS } from "@module/tooltip"
import { difficultyRelativeLevel } from "@util"
import { SpellData } from "./data"

class SpellGURPS extends ContainerGURPS {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" }

	unsatisfied_reason = ""

	// Static get schema(): typeof SpellData {
	// 	return SpellData;
	// }

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

	get defaultedFrom(): null {
		return null
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points
		if (this.actor) {
			points += this.actor.spellPointBonusesFor(this.name!, this.powerSource, this.college, this.tags, tooltip)
			points = Math.max(points, 0)
		}
		return points
	}

	get skillLevel(): string {
		if (this.calculateLevel.level === -Infinity) return "-"
		return this.calculateLevel.level.toString()
	}

	get relativeLevel(): string {
		if (this.calculateLevel.level === -Infinity) return "-"
		return (
			(this.actor?.attributes?.get(this.attribute)?.attribute_def.name ?? "") +
			this.calculateLevel.relative_level.signedString()
		)
	}

	// Point & Level Manipulation
	updateLevel(): boolean {
		const saved = this.level
		this.level = this.calculateLevel
		return saved.level !== this.level.level
	}

	get effectiveLevel(): number {
		if (!this.actor) return -Infinity
		let att = this.actor.resolveAttributeCurrent(this.attribute)
		let effectiveAtt = this.actor.resolveAttributeEffective(this.attribute)
		return this.calculateLevel.level - att + effectiveAtt
	}

	get calculateLevel(): SkillLevel {
		const tooltip = new TooltipGURPS()
		let relativeLevel = difficultyRelativeLevel(this.system.difficulty)
		let level = -Infinity
		if (this.actor) {
			let points = Math.trunc(this.points)
			level = this.actor.resolveAttributeCurrent(this.attribute)
			if (this.system.difficulty === Difficulty.Wildcard) points = Math.trunc(points / 3)
			if (points < 1) {
				level = -Infinity
				relativeLevel = 0
			} else if (points === 0) {
				// Do nothing
			} else if (points < 4) {
				relativeLevel += 1
			} else {
				relativeLevel += 1 + Math.trunc(points / 4)
			}
			if (level !== -Infinity) {
				relativeLevel += this.actor.spellBonusFor(
					this.name!,
					this.powerSource,
					this.college,
					this.tags,
					tooltip
				)
				relativeLevel = Math.trunc(relativeLevel)
				level += relativeLevel
			}
		}
		return {
			level: level,
			relative_level: relativeLevel,
			tooltip: tooltip.toString(),
		}
	}

	incrementSkillLevel() {
		const basePoints = this.points + 1
		let maxPoints = basePoints
		if (this.difficulty === Difficulty.Wildcard) maxPoints += 12
		else maxPoints += 4

		const oldLevel = this.calculateLevel.level
		for (let points = basePoints; points < maxPoints; points++) {
			this.system.points = points
			if (this.calculateLevel.level > oldLevel) {
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

		let oldLevel = this.calculateLevel.level
		for (let points = basePoints; points >= minPoints; points--) {
			this.system.points = points
			if (this.calculateLevel.level < oldLevel) {
				break
			}
		}

		if (this.points > 0) {
			let oldLevel = this.calculateLevel.level
			while (this.points > 0) {
				this.system.points = Math.max(this.points - 1, 0)
				if (this.calculateLevel.level !== oldLevel) {
					this.system.points++
					return this.update({ "system.points": this.points })
				}
			}
		}
	}
}

interface SpellGURPS {
	readonly system: SpellData
}

export { SpellGURPS }
