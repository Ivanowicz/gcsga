import { LocalizeGURPS } from "./localize"

export class LeveledAmount {
	level = 0

	amount = 1

	per_level = false

	constructor(data?: { level: number; amount: number; per_level: boolean }) {
		if (data) Object.assign(this, data)
	}

	formatWithLevel(asPercentage: boolean, what: string = LocalizeGURPS.translations.gurps.feature.level): string {
		let amt = this.amount.signedString()
		if (asPercentage) amt += "%"
		if (this.per_level) {
			let leveled = this.adjustedAmount.signedString()
			if (asPercentage) leveled += "%"
			return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.per_level_text, {
				leveled: leveled,
				amt: amt,
				what: what,
			})
		}
		return amt
	}

	format(what: string): string {
		const per_level = this.amount.signedString()
		if (this.per_level)
			return LocalizeGURPS.format(LocalizeGURPS.translations.gurps.feature.per_level_text, {
				total: this.adjustedAmount.signedString(),
				per_level,
				what,
			})
		return per_level
	}

	get adjustedAmount(): number {
		if (this.per_level) {
			if (this.level < 0) return 0
			return this.amount * this.level
		}
		return this.amount
	}
}
