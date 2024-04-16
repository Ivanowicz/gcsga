import { LastActor } from "@module/util/last-actor.ts"
import * as R from "remeda"
import type { TokenDocumentGURPS } from "@scene"
import { CanvasGURPS } from "../index.ts"

class TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {
	protected override _onControl(
		options?: { releaseOthers?: boolean | undefined; pan?: boolean | undefined } | undefined,
	): void {
		super._onControl(options)
		if (this.actor) LastActor.set(this.actor, this.document)
	}

	async showFloatyText(params: showFloatyTextOptions): Promise<void> {
		if (!this.isVisible) return

		const scrollingTextArgs = ((): Parameters<CanvasGURPS["interface"]["createScrollingText"]> | null => {
			if (typeof params === "number") {
				const quantity = params
				// TODO: allow changing this to something else arbitrarily
				const maxHP = this.actor?.pools?.HP?.max
				if (!(quantity && typeof maxHP === "number")) return null

				const percent = Math.clamped(Math.abs(quantity) / maxHP, 0, 1)
				const textColors = {
					damage: 16711680, // reddish
					healing: 65280, // greenish
				}
				return [
					this.center,
					params.signedString(),
					{
						anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
						jitter: 0.25,
						fill: textColors[quantity < 0 ? "damage" : "healing"],
						fontSize: 16 + 32 * percent, // Range between [16, 48]
						stroke: 0x000000,
						strokeThickness: 4,
					},
				]
			} else {
				const [change, details] = Object.entries(params)[0]
				const isAdded = change === "create"
				const sign = isAdded ? "+ " : "- "
				const appendedNumber = !/ \d+$/.test(details.name) && details.level ? ` ${details.level}` : ""
				const content = `${sign}${details.name}${appendedNumber}`
				const anchorDirection = isAdded ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM
				const textStyle = R.pick(this._getTextStyle(), ["fill", "fontSize", "stroke", "strokeThickness"])

				return [
					this.center,
					content,
					{
						...textStyle,
						anchor: anchorDirection,
						direction: anchorDirection,
						jitter: 0.25,
					},
				]
			}
		})()
		if (!scrollingTextArgs) return

		await this._animation
		await canvas.interface?.createScrollingText(...scrollingTextArgs)
	}
}

interface TokenGURPS<TDocument extends TokenDocumentGURPS = TokenDocumentGURPS> extends Token<TDocument> {}

type NumericFloatyEffect = { name: string; level?: number | null }
type showFloatyTextOptions =
	| number
	| { create: NumericFloatyEffect }
	| { update: NumericFloatyEffect }
	| { delete: NumericFloatyEffect }

export { TokenGURPS }
