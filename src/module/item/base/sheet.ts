import { CharacterGURPS } from "@actor"
import { FeatureType } from "@feature"
import { AttributeDefObj } from "@module/attribute"
import { gid, NumberComparison, PrereqType, SETTINGS, StringComparison, StudyType, SYSTEM_NAME } from "@module/data"
import { PDF } from "@module/pdf"
import { LocalizeGURPS, prepareFormData } from "@util"
import { BaseItemGURPS } from "."

export class ItemSheetGURPS<IType extends BaseItemGURPS = BaseItemGURPS> extends ItemSheet {
	declare object: IType

	static override get defaultOptions(): DocumentSheetOptions<Item> {
		const options = super.defaultOptions
		mergeObject(options, {
			width: 620,
			min_width: 620,
			height: 800,
			classes: options.classes.concat(["item", "gurps"]),
		})
		return options
	}

	getData(options?: Partial<DocumentSheetOptions<Item>>): any {
		const itemData = this.object.toObject(false)
		const attributes: Record<string, string> = {}
		const locations: Record<string, string> = {}
		locations[gid.All] = LocalizeGURPS.translations.gurps.feature.all_locations
		const default_attributes = game.settings.get(
			SYSTEM_NAME,
			`${SETTINGS.DEFAULT_ATTRIBUTES}.attributes`
		) as AttributeDefObj[]
		const default_hit_locations = {
			name: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.name`),
			roll: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.roll`),
			locations: game.settings.get(SYSTEM_NAME, `${SETTINGS.DEFAULT_HIT_LOCATIONS}.locations`),
		}
		const actor = this.item.actor as unknown as CharacterGURPS
		if (actor) {
			actor.attributes.forEach(e => {
				if (e.attribute_def.type.includes("_separator")) return
				attributes[e.id] = e.attribute_def.name
			})
			for (const e of actor.HitLocations) {
				locations[e.id] = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.field_prefix.dr, {
					location: e.choice_name,
				})
			}
		} else {
			default_attributes.forEach(e => {
				if (e.type.includes("_separator")) return
				attributes[e.id] = e.name
			})
			default_hit_locations.locations.forEach(e => {
				locations[e.id] = LocalizeGURPS.format(LocalizeGURPS.translations.gurps.field_prefix.dr, {
					location: e.choice_name,
				})
			})
		}
		attributes.dodge = LocalizeGURPS.translations.gurps.attributes.dodge
		attributes.parry = LocalizeGURPS.translations.gurps.attributes.parry
		attributes.block = LocalizeGURPS.translations.gurps.attributes.block
		const item = this.item

		const sheetData = {
			...super.getData(options),
			...{
				document: item,
				item: itemData,
				system: (itemData as any).system,
				config: CONFIG.GURPS,
				attributes: attributes,
				locations: locations,
				sysPrefix: "array.system.",
			},
		}

		return sheetData
	}

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/${this.item.type}/sheet.hbs`
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		html.find("textarea")
			.each(function () {
				this.setAttribute("style", `height:${this.scrollHeight + 2}px;overflow-y:hidden;`)
			})
			.on("input", event => {
				const e = event.currentTarget
				e.style.height = "0px"
				e.style.height = `${e.scrollHeight + 2}px`
			})

		html.find(".ref").on("click", event => PDF.handle(event))
		html.find(".prereq .add-child").on("click", event => this._addPrereqChild(event))
		html.find(".prereq .add-list").on("click", event => this._addPrereqList(event))
		html.find(".prereq .remove").on("click", event => this._removePrereq(event))
		html.find(".prereq .type").on("change", event => this._onPrereqTypeChange(event))
		html.find("#features .add").on("click", event => this._addFeature(event))
		html.find(".feature .remove").on("click", event => this._removeFeature(event))
		html.find(".feature .type").on("change", event => this._onFeatureTypeChange(event))
		html.find("#defaults .add").on("click", event => this._addDefault(event))
		html.find(".default .remove").on("click", event => this._removeDefault(event))
		html.find("#study .add").on("click", event => this._addStudy(event))
		html.find(".study-entry .remove").on("click", event => this._removeStudy(event))
	}

	private splitArray(s: string): string[] {
		const a: string[] = s.split(",").map(e => e.trim())
		if (a.length === 1 && a[0] === "") return []
		return a
	}

	protected async _updateObject(event: Event, formData: Record<string, any>): Promise<unknown> {
		formData = prepareFormData(formData, this.object)
		if (typeof formData["system.tags"] === "string")
			formData["system.tags"] = this.splitArray(formData["system.tags"])
		if (typeof formData["system.college"] === "string")
			formData["system.college"] = this.splitArray(formData["system.college"])
		return super._updateObject(event, formData)
	}

	protected async _addPrereqChild(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		const path = $(event.currentTarget).data("path").replace("array.", "")
		const prereqs = getProperty(this.item, `${path}.prereqs`)
		prereqs.push({
			type: "trait_prereq",
			name: { compare: StringComparison.Is, qualifier: "" },
			notes: { compare: StringComparison.None, qualifier: "" },
			level: { compare: NumberComparison.AtLeast, qualifier: 0 },
			has: true,
		})
		const formData: any = {}
		formData[`array.${path}.prereqs`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _addPrereqList(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		const path = $(event.currentTarget).data("path").replace("array.", "")
		const prereqs = getProperty(this.item, `${path}.prereqs`)
		prereqs.push({
			type: "prereq_list",
			prereqs: [],
			when_tl: { compare: NumberComparison.None },
		})
		const formData: any = {}
		formData[`array.${path}.prereqs`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _removePrereq(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		let path = $(event.currentTarget).data("path").replace("array.", "")
		const items = path.split(".")
		const index = items.pop()
		path = items.join(".")
		const prereqs = getProperty(this.item, `${path}`)
		prereqs.splice(index, 1)
		const formData: any = {}
		formData[`array.${path}`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _onPrereqTypeChange(event: JQuery.ChangeEvent): Promise<any> {
		event.preventDefault()
		const value = event.currentTarget.value
		const PrereqConstructor = CONFIG.GURPS.Prereq.classes[value as PrereqType]
		let path = $(event.currentTarget).data("path").replace("array.", "")
		const items = path.split(".")
		const index = items.pop()
		path = items.join(".")
		const prereqs = getProperty(this.item, `${path}`)
		prereqs[index] = {
			type: value,
			...PrereqConstructor.defaults,
			has: prereqs[index].has,
		}
		const formData: any = {}
		formData[`array.${path}`] = prereqs
		return this._updateObject(null as unknown as Event, formData)
	}

	protected async _addFeature(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		const features = (this.item.system as any).features
		features.push({
			type: FeatureType.AttributeBonus,
			attribute: "st",
			limitation: "none",
			amount: 1,
			per_level: false,
			levels: 0,
		})
		const update: any = {}
		update["system.features"] = features
		return this.item.update(update)
	}

	protected async _removeFeature(event: JQuery.ClickEvent): Promise<any> {
		const index = $(event.currentTarget).data("index")
		const features = (this.item.system as any).features
		features.splice(index, 1)
		const update: any = {}
		update["system.features"] = features
		return this.item.update(update)
	}

	protected async _addDefault(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		const defaults = (this.item.system as any).defaults ?? []
		defaults.push({
			type: gid.Skill,
			name: "",
			specialization: "",
			modifier: 0,
		})
		const update: any = {}
		update["system.defaults"] = defaults
		await this.item.update(update)
		this.render()
	}

	protected async _removeDefault(event: JQuery.ClickEvent): Promise<any> {
		const index = $(event.currentTarget).data("index")
		const defaults = (this.item.system as any).defaults ?? []
		defaults.splice(index, 1)
		const update: any = {}
		update["system.defaults"] = defaults
		await this.item.update(update)
		this.render()
	}

	protected async _addStudy(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault()
		const study = (this.item.system as any).study
		study.push({
			type: StudyType.Self,
			hours: 0,
			note: "",
		})
		const update: any = {}
		update["system.study"] = study
		return this.item.update(update)
	}

	protected async _removeStudy(event: JQuery.ClickEvent): Promise<any> {
		const index = $(event.currentTarget).data("index")
		const study = (this.item.system as any).study
		study.splice(index, 1)
		const update: any = {}
		update["system.study"] = study
		return this.item.update(update)
	}

	protected async _onFeatureTypeChange(event: JQuery.ChangeEvent): Promise<any> {
		const value = event.currentTarget.value
		const index = $(event.currentTarget).data("index")
		const FeatureConstructor = CONFIG.GURPS.Feature.classes[value as FeatureType]
		const features = (this.item.system as any).features
		features[index] = {
			type: value,
			...FeatureConstructor.defaults,
		}
		// Const preUpdate: any = {}
		const update: any = {}
		// PreUpdate[`system.features.${index}`] = {}
		update["system.features"] = features
		// Await this.item.update(preUpdate, { render: false })
		return this.item.update(update)
	}

	get item(): this["object"] {
		return this.object
	}

	protected override _getHeaderButtons(): Application.HeaderButton[] {
		const buttons: Application.HeaderButton[] = []
		const all_buttons = [...buttons, ...super._getHeaderButtons()]
		all_buttons.at(-1)!.label = ""
		all_buttons.at(-1)!.icon = "gcs-circled-x"
		return all_buttons
	}
}
