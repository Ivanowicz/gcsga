import { ActorFlags, ActorSheetGURPS } from "@actor/base"
import { StaticItemGURPS } from "@item"
import { RollType, SETTINGS, SYSTEM_NAME } from "@module/data"
import { PDF } from "@module/pdf"
import { RollGURPS } from "@module/roll"
import { LocalizeGURPS, Static } from "@util"
import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.mjs"
import { StaticCharacterSheetConfig } from "./config_sheet"
import { StaticAttributeName, staticFpConditions, staticHpConditions, StaticSecondaryAttributeName } from "./data"
import { StaticCharacterGURPS } from "./document"

export class StaticCharacterSheetGURPS extends ActorSheetGURPS {
	config: StaticCharacterSheetConfig | null = null

	static get defaultOptions(): ActorSheet.Options {
		return mergeObject(super.defaultOptions, {
			classes: super.defaultOptions.classes.concat(["static"]),
			width: 800,
			height: 800,
			tabs: [{ navSelector: ".tabs-navigation", contentSelector: ".tabs-content", initial: "lifting" }],
			scrollY: [
				".gurpsactorsheet #advantages #reactions #melee #ranged #skills #spells #equipmentcarried #equipmentother #notes",
			],
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
		})
	}

	get template(): string {
		if (!game.user?.isGM && this.actor.limited)
			return `systems${SYSTEM_NAME}/templates/actor/static/sheet_limited.hbs`
		return `/systems/${SYSTEM_NAME}/templates/actor/static/sheet.hbs`
	}

	getData(options?: Partial<ActorSheet.Options> | undefined): any {
		const actorData = this.actor.toObject(false) as any
		const items = deepClone(
			(this.actor.items as EmbeddedCollection<any, any>)
				.map(item => item)
				.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
		)

		let deprecation: string = this.actor.getFlag(SYSTEM_NAME, ActorFlags.Deprecation) ? "acknowledged" : "manual"
		// Don't show deprecation warning if character is not imported
		if (deprecation === "manual") {
			if (this.actor.system.additionalresources.importpath.includes(".gcs")) deprecation = "easy"
			if (this.actor.system.additionalresources.importpath.includes(".gca5")) deprecation = "easy"
		}

		// console.log(actorData.system)
		const sheetData = {
			...super.getData(options),
			items,
			system: actorData.system,
			editing: this.actor.editing,
			// Ranges: Static.rangeObject.ranges,
			// useCI: GURPS.ConditionalInjury.isInUse(),
			// conditionalEffectsTable = GURPS.ConditionalInjury.conditionalEffectsTable(),
			eqtsummary: this.actor.system.eqtsummary,
			isGM: game.user?.isGM,
			effects: this.actor.getEmbeddedCollection("ActiveEffect").contents,
			// UseQN: game.settings.get(SYSTEM_NAME, settings.SETTING_USE_QUINTESSENCE),
			current_year: new Date().getFullYear(),
			maneuvers: CONFIG.GURPS.select.maneuvers,
			postures: CONFIG.GURPS.select.postures,
			move_types: CONFIG.GURPS.select.move_types,
			deprecation: deprecation,
			conditions: this._prepareTrackers(),
		}
		// this.prepareItems(sheetData)

		this._prepareItems(sheetData, items)
		this._prepareBlockLayout(sheetData)
		return sheetData
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)
		// Html.find(".input").on("change", event => this._resizeInput(event))
		html.find(".dropdown-toggle").on("click", event => this._onCollapseToggle(event))
		html.find(".ref").on("click", event => PDF.handle(event))
		// Html.find(".item").on("dblclick", event => this._openItemSheet(event))
		// html.find(".equipped").on("click", event => this._onEquippedToggle(event))
		html.find(".rollable").on("mouseover", event => this._onRollableHover(event, true))
		html.find(".rollable").on("mouseout", event => this._onRollableHover(event, false))
		html.find(".rollable").on("click", event => this._onClickRoll(event))
		html.find(".rollable").on("contextmenu", event => this._onClickRoll(event))
		html.find(".equipped").on("click", event => this._onClickEquip(event))
		html.find(".deprecation a").on("click", event => {
			event.preventDefault()
			this.actor.setFlag(SYSTEM_NAME, ActorFlags.Deprecation, true)
		})

		html.find(".item").on("dblclick", event => this._openItemSheet(event))

		// Maneuver / Posture Selection
		html.find(".move-select").on("change", event => this._onMoveChange(event))
	}

	// private prepareItems(data: { items: StaticItemGURPS[]; system: StaticCharacterSystemData } & any) {
	// 	console.log(data)
	// 	console.log(data.system.ads)
	// 	console.log(Static.flatList(data.system.ads, 0, "", {}, false))
	// 	const [traits, skills, spells, equipment, other_equipment, notes, melee, ranged] = [
	// 		Object.values(Static.flatList(data.system.ads ?? {}, 0, "", {}, false)),
	// 		Object.values(Static.flatList(data.system.skills ?? {}, 0, "", {}, false)),
	// 		Object.values(Static.flatList(data.system.spells ?? {}, 0, "", {}, false)),
	// 		Object.values(Static.flatList(data.system.equipment.carried ?? {}, 0, "", {}, false)),
	// 		Object.values(Static.flatList(data.system.equipment.other ?? {}, 0, "", {}, false)),
	// 		Object.values(Static.flatList(data.system.notes ?? {}, 0, "", {}, false)),
	// 		Object.values(Static.flatList(data.system.melee ?? {}, 0, "", {}, false)),
	// 		Object.values(Static.flatList(data.system.ranged ?? {}, 0, "", {}, false)),
	// 	]
	// 	data.items.forEach((e: StaticItemGURPS) => {
	// 		Object.values(Static.flatList(e.system.ads, 0, "", {}, false)).forEach(f => traits.push(f))
	// 		Object.values(Static.flatList(e.system.skills, 0, "", {}, false)).forEach(f => skills.push(f))
	// 		Object.values(Static.flatList(e.system.spells, 0, "", {}, false)).forEach(f => spells.push(f))
	// 		Object.values(Static.flatList(e.system.melee, 0, "", {}, false)).forEach(f => melee.push(f))
	// 		Object.values(Static.flatList(e.system.ranged, 0, "", {}, false)).forEach(f => ranged.push(f))
	// 		if (e.system.equipped) equipment.push(e.system.eqt)
	// 		else other_equipment.push(e.system.eqt)
	// 	})

	// 	data.traits = traits
	// 	data.skills = skills
	// 	data.spells = spells
	// 	data.equipment = equipment
	// 	data.other_equipment = other_equipment
	// 	data.notes = notes
	// 	data.melee = melee
	// 	data.ranged = ranged

	// 	console.log(data)
	// }

	private _prepareTrackers(): any {
		function _getConditionKey(pts: any, conditions: Record<string, any>) {
			let found = "NORMAL"
			for (const [key, value] of Object.entries(conditions)) {
				if (pts && pts.value > value.breakpoint(pts)) {
					return found
				}
				found = key
			}
			return found
		}
		function hpCondition(HP: any, member: string) {
			let key = _getConditionKey(HP, staticHpConditions)
			return (staticHpConditions as any)[key][member]
		}
		function fpCondition(FP: any, member: string) {
			let key = _getConditionKey(FP, staticFpConditions)
			return (staticFpConditions as any)[key][member]
		}

		return {
			HP: hpCondition(this.actor.system.HP, "label"),
			FP: fpCondition(this.actor.system.FP, "label"),
		}
	}

	private _prepareItems(sheetData: any, items: StaticItemGURPS[]) {
		const tempItems = {
			melee: [...Object.values(sheetData.system.melee)],
			ranged: [...Object.values(sheetData.system.ranged)],
			traits: [...Object.values(sheetData.system.ads)],
			skills: [...Object.values(sheetData.system.skills)],
			spells: [...Object.values(sheetData.system.spells)],
			equipment: [...Object.values(sheetData.system.equipment.carried)],
			other_equipment: [...Object.values(sheetData.system.equipment.other)],
			notes: [...Object.values(sheetData.system.notes)],
		}

		items.forEach(e => {
			Object.values(e.system.melee).forEach(a => {
				tempItems.melee.push({ ...a, itemid: e.id })
			})
			Object.values(e.system.ranged).forEach(a => {
				tempItems.ranged.push({ ...a, itemid: e.id })
			})
			Object.values(e.system.ads).forEach(a => {
				tempItems.traits.push({ ...a, itemid: e.id })
			})
			Object.values(e.system.skills).forEach(a => {
				tempItems.skills.push({ ...a, itemid: e.id })
			})
			Object.values(e.system.spells).forEach(a => {
				tempItems.spells.push({ ...a, itemid: e.id })
			})
			tempItems[e.system.carried ? "equipment" : "other_equipment"].push({ ...e.system.eqt, itemid: e.id })
		})

		sheetData.items = {
			melee: Object.fromEntries(tempItems.melee.map((v, k) => [k.toString().padStart(5, "0"), v])),
			ranged: Object.fromEntries(tempItems.ranged.map((v, k) => [k.toString().padStart(5, "0"), v])),
			traits: Object.fromEntries(tempItems.traits.map((v, k) => [k.toString().padStart(5, "0"), v])),
			skills: Object.fromEntries(tempItems.skills.map((v, k) => [k.toString().padStart(5, "0"), v])),
			spells: Object.fromEntries(tempItems.spells.map((v, k) => [k.toString().padStart(5, "0"), v])),
			equipment: Object.fromEntries(tempItems.equipment.map((v, k) => [k.toString().padStart(5, "0"), v])),
			other_equipment: Object.fromEntries(
				tempItems.other_equipment.map((v, k) => [k.toString().padStart(5, "0"), v])
			),
		}
	}

	private _prepareBlockLayout(data: any): void {
		const system = {
			...data.items,
			reactions: this.actor.system.reactions,
			conditionalmods: this.actor.system.conditionalmods,
		}
		function notEmpty(o: any) {
			return o ? Object.values(o).length > 0 : false
		}
		const outAr = []
		if (notEmpty(system.reactions) || notEmpty(system.conditionalmods)) {
			if (!notEmpty(system.reactions)) outAr.push("conditional_modifiers conditional_modifiers")
			else if (!notEmpty(system.conditionalmods)) outAr.push("reactions reactions")
			else outAr.push("reactions conditional_modifiers")
		}
		if (notEmpty(system.melee)) outAr.push("melee melee")
		if (notEmpty(system.ranged)) outAr.push("ranged ranged")
		if (notEmpty(system.traits) || notEmpty(system.skills)) {
			if (!notEmpty(system.traits)) outAr.push("skills skills")
			else if (!notEmpty(system.skills)) outAr.push("traits traits")
			else outAr.push("traits skills")
		}
		if (notEmpty(system.spells)) outAr.push("spells spells")

		if (notEmpty(system.equipment)) outAr.push("equipment equipment")
		if (notEmpty(system.other_equipment)) outAr.push("other_equipment other_equipment")
		if (notEmpty(system.notes)) outAr.push("notes notes")

		data.layout = `"${outAr.join('" "')}";`
	}

	async _onMoveChange(event: JQuery.ChangeEvent): Promise<any> {
		event.preventDefault()
		event.stopPropagation()
		const element = $(event.currentTarget)
		const type = element.data("name")
		switch (type) {
			case "maneuver":
				await this.actor.update({ "system.move.maneuver": element.val() }, { render: false })
				return this.actor.changeManeuver(element.val() as any)
			case "posture":
				await this.actor.update({ "system.move.posture": element.val() }, { render: false })
				return this.actor.changePosture(element.val() as any)
			default:
				return this.actor.update({ "system.move.type": element.val() })
		}
	}

	protected _onCollapseToggle(event: JQuery.ClickEvent): void {
		event.preventDefault()
		const path = $(event.currentTarget).data("key")
		this.actor.toggleExpand(path)
	}

	async _onClickEquip(event: JQuery.ClickEvent) {
		event.preventDefault()
		const key = $(event.currentTarget).data("key")
		let eqt = duplicate(Static.decode(this.actor, key))
		eqt.equipped = !eqt.equipped
		await this.actor.update({ [key]: eqt })
		await this.actor.updateItemAdditionsBasedOn(eqt, key)
		let p = this.actor.getEquippedParry()
		let b = this.actor.getEquippedBlock()
		await this.actor.update({
			"system.equippedparry": p,
			"system.equippedblock": b,
		})
	}

	protected async _onClickRoll(event: JQuery.ClickEvent | JQuery.ContextMenuEvent) {
		event.preventDefault()
		const element = $(event.currentTarget)
		if (this.actor.editing) return
		const type: RollType = $(event.currentTarget).data("type")
		const data: Record<string, any> = { type: type, hidden: event.ctrlKey }
		const items = this.getData().items
		if (type === RollType.Attribute) {
			const attribute = {
				current: 0,
				effective: 0,
				attr_id: "",
				attribute_def: {
					combinedName: "",
				},
			}
			if (["frightcheck", "vision", "hearing", "tastesmell", "touch"].includes(element.data("id"))) {
				attribute.effective = attribute.current =
					this.actor.system[element.data("id") as StaticSecondaryAttributeName]
			} else {
				attribute.effective = attribute.current =
					this.actor.system.attributes[element.data("id") as StaticAttributeName].value
			}
			attribute.attribute_def.combinedName = game.i18n.localize(
				`gurps.static.${element.data("id").toLowerCase()}`
			)
			attribute.attr_id = element.data("id").toLowerCase()
			data.attribute = attribute
			return RollGURPS.handleRoll(game.user, this.actor, data)
		}
		const key = element.data("item-id")
		switch (type) {
			case RollType.Skill:
			case RollType.SkillRelative:
				data.item = {
					formattedName: getProperty(items, `skills.${key}.name`),
					skillLevel: getProperty(items, `skills.${key}.import`),
					effectiveLevel: getProperty(items, `skills.${key}.import`),
				}
				return RollGURPS.handleRoll(game.user, this.actor, data)
			case RollType.Spell:
			case RollType.SpellRelative:
				data.item = {
					formattedName: getProperty(items, `spells.${key}.name`),
					skillLevel: getProperty(items, `spells.${key}.import`),
					effectiveLevel: getProperty(items, `skills.${key}.import`),
				}
				return RollGURPS.handleRoll(game.user, this.actor, data)
			case RollType.Attack:
				data.item = {
					formattedName: getProperty(items, `${element.data("weapon")}.${key}.name`),
					usage: getProperty(items, `${element.data("weapon")}.${key}.mode`),
					skillLevel: getProperty(items, `${element.data("weapon")}.${key}.import`),
				}
				return RollGURPS.handleRoll(game.user, this.actor, data)
			case RollType.Parry:
			case RollType.Block:
				data.item = {
					formattedName: getProperty(items, `${element.data("weapon")}.${key}.name`),
					usage: getProperty(items, `${element.data("weapon")}.${key}.mode`),
					skillLevel: getProperty(items, `${element.data("weapon")}.${key}.${type}`),
					parry: getProperty(items, `${element.data("weapon")}.${key}.${type}`),
					block: getProperty(items, `${element.data("weapon")}.${key}.${type}`),
				}
				return RollGURPS.handleRoll(game.user, this.actor, data)
			case RollType.Damage:
				data.item = {
					formattedName: getProperty(items, `${element.data("weapon")}.${key}.name`),
					usage: getProperty(items, `${element.data("weapon")}.${key}.mode`),
					fastResolvedDamage: getProperty(items, `${element.data("weapon")}.${key}.damage`),
				}
				return RollGURPS.handleRoll(game.user, this.actor, data)
			case RollType.Modifier:
				data.modifier = element.data("modifier")
				data.comment = element.data("comment")
				if (event.type === "contextmenu") data.modifier = -data.modifier
				return RollGURPS.handleRoll(game.user, this.actor, data)
		}
	}

	protected async _onRollableHover(event: JQuery.MouseOverEvent | JQuery.MouseOutEvent, hover: boolean) {
		event.preventDefault()
		if (this.actor.editing) {
			event.currentTarget.classList.remove("hover")
			return
		}
		if (hover) event.currentTarget.classList.add("hover")
		else event.currentTarget.classList.remove("hover")
	}

	async _onEditToggle(event: JQuery.ClickEvent) {
		event.preventDefault()
		await this.actor.update({ "system.editing": !this.actor.editing })
		$(event.currentTarget).find("i").toggleClass("fa-unlock fa-lock")
		return this.render()
	}

	protected override _getHeaderButtons(): Application.HeaderButton[] {
		const edit_button = {
			label: "",
			class: "edit-toggle",
			icon: `fas fa-${this.actor.editing ? "un" : ""}lock`,
			onclick: (event: any) => this._onEditToggle(event),
		}
		const buttons: Application.HeaderButton[] = this.actor.canUserModify(game.user!, "update")
			? [
					{
						label: "",
						class: "gmenu",
						icon: "gcs-all-seeing-eye",
						onclick: event => this._onGMenu(event),
					},
			  ]
			: []
		const show_import = game.settings.get(SYSTEM_NAME, SETTINGS.SHOW_IMPORT_BUTTON) ?? false
		const import_path = this.actor.system.additionalresources.importpath
		let label = LocalizeGURPS.translations.gurps.character.header.import
		if (import_path) label = LocalizeGURPS.translations.gurps.character.header.reimport
		if (show_import)
			buttons.unshift({
				label: label,
				class: "import",
				icon: "fas fa-file-import",
				onclick: event => this._onFileImport(event),
			})
		const all_buttons = [edit_button, ...buttons, ...super._getHeaderButtons()]
		return all_buttons
	}

	protected async _updateObject(event: Event, formData: any): Promise<unknown> {
		Object.keys(formData).forEach(k => {
			if (k.startsWith("system.additionalresources.tracker")) {
				const tracker_k = k.replace(/.value$/, "")
				const max = getProperty(this.actor, `${tracker_k}.max`)
				const max_enforced = getProperty(this.actor, `${tracker_k}.isMaxEnforced`)
				const min = getProperty(this.actor, `${tracker_k}.min`)
				const min_enforced = getProperty(this.actor, `${tracker_k}.isMinEnforced`)
				if (max_enforced && formData[k] > max) formData[k] = max
				if (min_enforced && formData[k] < min) formData[k] = min
			}
		})
		await super._updateObject(event, formData)
		return this.render()
	}

	async _onFileImport(event: any) {
		event.preventDefault()
		this.actor.importCharacter()
	}

	protected async _onGMenu(event: JQuery.ClickEvent) {
		event.preventDefault()
		this.config ??= new StaticCharacterSheetConfig(this.document as StaticCharacterGURPS, {
			top: this.position.top! + 40,
			left: this.position.left! + (this.position.width! - DocumentSheet.defaultOptions.width!) / 2,
		})
		this.config.render(true)
		// New CharacterSheetConfig(this.document as StaticCh, {
		// 	top: this.position.top! + 40,
		// 	left: this.position.left! + (this.position.width! - DocumentSheet.defaultOptions.width!) / 2,
		// }).render(true)
	}

	async close(options?: FormApplication.CloseOptions | undefined): Promise<void> {
		await this.config?.close(options)
		return super.close(options)
	}

	protected _openItemSheet(event: JQuery.DoubleClickEvent) {
		event.preventDefault()
		const id = $(event.currentTarget).data("item-id")
		if (!id) return
		const item = this.actor.items.get(id)
		return item?.sheet?.render(true)
	}
}

export interface StaticCharacterSheetGURPS extends ActorSheetGURPS {
	editing: boolean
	object: StaticCharacterGURPS
}
