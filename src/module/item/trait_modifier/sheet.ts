import { ItemSheetGCS } from "@item/gcs"
import { TraitModifierGURPS } from "."

export class TraitModifierSheet extends ItemSheetGCS {
	static get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			classes: options.classes.concat(["modifier"]),
		})
		return options
	}

	getData(options?: Partial<DocumentSheetOptions<Item>> | undefined) {
		const adjustedCostType =
			(this.item as TraitModifierGURPS).system.cost_type === "percentage" &&
				(this.item as TraitModifierGURPS).isLeveled
				? "percentage_leveled"
				: (this.item as TraitModifierGURPS).system.cost_type
		const sheetData = {
			...super.getData(options),
			system: {
				...super.getData(options).system,
				...{
					cost_type: adjustedCostType,
				},
			},
		}
		return sheetData
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
	}

	protected _updateObject(event: Event, formData: Record<string, any>): Promise<unknown> {
		if (Object.keys(formData).includes("system.disabled"))
			formData["system.disabled"] = !formData["system.disabled"]

		if (formData["system.cost_type"] === "percentage_leveled") {
			formData["system.levels"] = 1
			formData["system.cost_type"] = "percentage"
		} else {
			formData["system.levels"] = "0"
		}
		return super._updateObject(event, formData)
	}
}
