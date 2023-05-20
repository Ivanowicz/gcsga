import { ActorSheetGURPS } from "@actor/base"
import { ActorFlags } from "@actor/base/data"
import { StaticItemGURPS } from "@item"
import { RollType, SETTINGS, SYSTEM_NAME } from "@module/data"
import { PDF } from "@module/pdf"
import { RollGURPS } from "@module/roll"
import { LocalizeGURPS, Static } from "@util"
import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.mjs"
import { StaticCharacterSheetConfig } from "./config_sheet"
import { StaticAttributeName, StaticCharacterSystemData, staticFpConditions, staticHpConditions, StaticSecondaryAttributeName } from "./data"
import { StaticCharacterGURPS } from "./document"

export class StaticCharacterSheetGURPS extends ActorSheetGURPS {
	config: StaticCharacterSheetConfig | null = null

	static get defaultOptions(): ActorSheet.Options {
		return mergeObject(super.defaultOptions, {
			classes: super.defaultOptions.classes.concat(["character", "static"]),
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
			return `systems${SYSTEM_NAME}/templates/actor/static_character/sheet_limited.hbs`
		return `/systems/${SYSTEM_NAME}/templates/actor/static_character/sheet.hbs`
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

		console.log(actorData.system)
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
			layout: this._prepareBlockLayout(),
		}
		this.prepareItems(sheetData)

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

		// Maneuver / Posture Selection
		html.find(".move-select").on("change", event => this._onMoveChange(event))
	}

	private prepareItems(data: { items: StaticItemGURPS[], system: StaticCharacterSystemData } & any) {
		console.log(data)
		console.log(data.system.ads)
		console.log(Static.flatList(data.system.ads, 0, "", {}, false))
		const [traits, skills, spells, equipment, other_equipment, notes, melee, ranged] = [
			Object.values(Static.flatList((data.system.ads ?? {}), 0, "", {}, false)),
			Object.values(Static.flatList((data.system.skills ?? {}), 0, "", {}, false)),
			Object.values(Static.flatList((data.system.spells ?? {}), 0, "", {}, false)),
			Object.values(Static.flatList((data.system.equipment.carried ?? {}), 0, "", {}, false)),
			Object.values(Static.flatList((data.system.equipment.other ?? {}), 0, "", {}, false)),
			Object.values(Static.flatList((data.system.notes ?? {}), 0, "", {}, false)),
			Object.values(Static.flatList((data.system.melee ?? {}), 0, "", {}, false)),
			Object.values(Static.flatList((data.system.ranged ?? {}), 0, "", {}, false)),
		]
		data.items.forEach((e: StaticItemGURPS) => {
			Object.values(Static.flatList(e.system.ads, 0, "", {}, false)).forEach(f => traits.push(f))
			Object.values(Static.flatList(e.system.skills, 0, "", {}, false)).forEach(f => skills.push(f))
			Object.values(Static.flatList(e.system.spells, 0, "", {}, false)).forEach(f => spells.push(f))
			Object.values(Static.flatList(e.system.melee, 0, "", {}, false)).forEach(f => melee.push(f))
			Object.values(Static.flatList(e.system.ranged, 0, "", {}, false)).forEach(f => ranged.push(f))
			if (e.system.equipped) equipment.push(e.system.eqt)
			else other_equipment.push(e.system.eqt)
		})

		data.traits = traits
		data.skills = skills
		data.spells = spells
		data.equipment = equipment
		data.other_equipment = other_equipment
		data.notes = notes
		data.melee = melee
		data.ranged = ranged

		console.log(data)
	}

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

	private _prepareBlockLayout(): string {
		const system = this.actor.system
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
		if (notEmpty(system.ads) || notEmpty(system.skills)) {
			if (!notEmpty(system.ads)) outAr.push("skills skills")
			else if (!notEmpty(system.skills)) outAr.push("traits traits")
			else outAr.push("traits skills")
		}
		if (notEmpty(system.spells)) outAr.push("spells spells")

		if (notEmpty(system.equipment?.carried)) outAr.push("equipment equipment")
		if (notEmpty(system.equipment?.other)) outAr.push("other_equipment other_equipment")
		if (notEmpty(system.notes)) outAr.push("notes notes")
		return `"${outAr.join('" "')}";`
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
		if (this.actor.editing) return
		const type: RollType = $(event.currentTarget).data("type")
		const data: Record<string, any> = { type: type, hidden: event.ctrlKey }
		if (type === RollType.Attribute) {
			const attribute = {
				current: 0,
				attr_id: "",
				attribute_def: {
					combinedName: "",
				},
			}
			if (
				["frightcheck", "vision", "hearing", "tastesmell", "touch"].includes($(event.currentTarget).data("id"))
			) {
				attribute.current = this.actor.system[$(event.currentTarget).data("id") as StaticSecondaryAttributeName]
			} else {
				attribute.current =
					this.actor.system.attributes[$(event.currentTarget).data("id") as StaticAttributeName].value
			}
			attribute.attribute_def.combinedName = game.i18n.localize(
				`gurps.static.${$(event.currentTarget).data("id").toLowerCase()}`
			)
			attribute.attr_id = $(event.currentTarget).data("id").toLowerCase()
			data.attribute = attribute
		}
		if ([RollType.Skill, RollType.SkillRelative, RollType.Spell, RollType.SpellRelative].includes(type)) {
			Static.recurseList(this.actor.system.skills, e => {
				if (e.uuid === $(event.currentTarget).data("uuid")) {
					console.log(e)
					data.item = {
						formattedName: e.name,
						skillLevel: e.level,
					}
				}
			})
		}
		if (type === RollType.Attack) {
			Static.recurseList(
				this.actor.system[$(event.currentTarget).data("weapon") as "melee" | "ranged"],
				(e, k) => {
					if (k === $(event.currentTarget).data("uuid"))
						data.item = {
							itemName: e.name,
							usage: e.mode,
							skillLevel: parseInt(e.import) || 0,
						}
				}
			)
		}
		if ([RollType.Parry, RollType.Block].includes(type)) {
			Static.recurseList(
				this.actor.system[$(event.currentTarget).data("weapon") as "melee" | "ranged"],
				(e, k) => {
					if (k === $(event.currentTarget).data("uuid")) {
						data.item = {
							itemName: e.name,
							usage: e.mode,
							skillLevel: parseInt(e[type]),
						}
					}
				}
			)
		}
		if (type === RollType.Damage) {
			Static.recurseList(
				this.actor.system[$(event.currentTarget).data("weapon") as "melee" | "ranged"],
				(e, k) => {
					if (k === $(event.currentTarget).data("uuid"))
						data.item = {
							itemName: e.name,
							usage: e.mode,
							fastResolvedDamage: e.damage,
						}
				}
			)
		}
		if (type === RollType.Modifier) {
			data.modifier = $(event.currentTarget).data("modifier")
			data.comment = $(event.currentTarget).data("comment")
			if (event.type === "contextmenu") data.modifier = -data.modifier
		}
		return RollGURPS.staticHandleRoll(game.user, this.actor, data)
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
}

export interface StaticCharacterSheetGURPS extends ActorSheetGURPS {
	editing: boolean
	object: StaticCharacterGURPS
}
