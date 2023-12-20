import { BaseFeature } from "@feature"
import { ContainerGURPS } from "@item/container"
import { MeleeWeaponGURPS } from "@item/melee_weapon"
import { RangedWeaponGURPS } from "@item/ranged_weapon"
import { BaseWeaponGURPS } from "@item/weapon"
import { Feature, ItemDataGURPS } from "@module/config"
import { ActorType, ItemType, Study, SYSTEM_NAME } from "@module/data"
import { PrereqList } from "@prereq"
import { getAdjustedStudyHours, LocalizeGURPS } from "@util"
import { HandlebarsHelpersGURPS } from "@util/handlebars_helpers"
import { DocumentModificationOptions } from "types/foundry/common/abstract/document.mjs"
import { ItemDataConstructorData } from "types/foundry/common/data/data.mjs/itemData"
import { BaseUser } from "types/foundry/common/documents.mjs"
import { MergeObjectOptions } from "types/foundry/common/utils/helpers.mjs"
import { ItemGCSSource } from "./data"

export abstract class ItemGCS<SourceType extends ItemGCSSource = ItemGCSSource> extends ContainerGURPS<SourceType> {
	unsatisfied_reason = ""

	protected async _preCreate(
		data: ItemDataGURPS,
		options: DocumentModificationOptions,
		user: BaseUser
	): Promise<void> {
		let type = data.type.replace("_container", "")
		if (type === ItemType.Technique) type = ItemType.Skill
		else if (type === ItemType.RitualMagicSpell) type = ItemType.Spell
		else if (type === ItemType.Equipment) type = "equipment"
		else if (type === ItemType.LegacyEquipment) type = "legacy_equipment"
		if (this._source.img === (foundry.documents.BaseItem as any).DEFAULT_ICON)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${type}.svg`
		let gcs_type: string = data.type
		if (gcs_type === ItemType.Equipment) gcs_type = "equipment"
		;(this._source.system as any).type = gcs_type
		await super._preCreate(data, options, user)
	}

	override async update(
		data: DeepPartial<ItemDataConstructorData | (ItemDataConstructorData & Record<string, unknown>)>,
		context?: DocumentModificationContext & MergeObjectOptions & { noPrepare?: boolean }
	): Promise<this | undefined> {
		if (!(this.parent instanceof Item)) return super.update(data, context)
		data._id = this.id
		await this.container?.updateEmbeddedDocuments("Item", [data])
		// @ts-expect-error type not properly declared, to do later
		this.render(false, { action: "update", data: data })
	}

	override get actor(): (typeof CONFIG.GURPS.Actor.documentClasses)[ActorType.Character] | null {
		const actor = super.actor
		if (actor?.type === ActorType.Character) return actor
		return null
	}

	get isContainer(): boolean {
		return [
			ItemType.TraitContainer,
			ItemType.SkillContainer,
			ItemType.SpellContainer,
			ItemType.EquipmentContainer,
			ItemType.TraitModifierContainer,
			ItemType.EquipmentModifierContainer,
			ItemType.NoteContainer,
		].includes(this.type as any)
	}

	get formattedName(): string {
		return this.name ?? ""
	}

	get enabled(): boolean | undefined {
		return undefined
	}

	get tags(): string[] {
		return this.system.tags
	}

	get secodaryText(): string {
		let outString = '<div class="item-notes">'
		if (this.system.notes) outString += HandlebarsHelpersGURPS.format(this.system.notes)
		if (this.studyHours !== 0)
			outString += LocalizeGURPS.format(LocalizeGURPS.translations.gurps.study.studied, {
				hours: this.studyHours,
				total: (this.system as any).study_hours_needed,
			})
		if (this.unsatisfied_reason) outString += HandlebarsHelpersGURPS.unsatisfied(this.unsatisfied_reason)
		outString += "</div>"
		return outString
	}

	get reference(): string {
		return this.system.reference
	}

	get features(): Feature[] {
		if (this.system.hasOwnProperty("features")) {
			return (this.system as any).features.map(
				(e: Partial<Feature>) => new BaseFeature({ ...e, parent: this.uuid, item: this })
			)
		}
		return []
	}

	get prereqs() {
		if (!(this.system as any).prereqs) return new PrereqList()
		return new PrereqList((this.system as any).prereqs)
	}

	get prereqsEmpty(): boolean {
		if (!(this.system as any).prereqs.prereqs) return true
		return this.prereqs?.prereqs.length === 0
	}

	get meleeWeapons(): Collection<MeleeWeaponGURPS> {
		const meleeWeapons: Collection<MeleeWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof MeleeWeaponGURPS) meleeWeapons.set(item._id, item)
		}
		return meleeWeapons
	}

	get rangedWeapons(): Collection<RangedWeaponGURPS> {
		const rangedWeapons: Collection<RangedWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof RangedWeaponGURPS) rangedWeapons.set(item._id, item)
		}
		return rangedWeapons
	}

	get weapons(): Collection<BaseWeaponGURPS> {
		const weapons: Collection<BaseWeaponGURPS> = new Collection()
		for (const item of this.items) {
			if (item instanceof BaseWeaponGURPS) weapons.set(item._id, item)
		}
		return weapons
	}

	get studyHours(): number {
		if (
			![ItemType.Trait, ItemType.Skill, ItemType.Technique, ItemType.Spell, ItemType.RitualMagicSpell].includes(
				this.type as ItemType
			)
		)
			return 0
		return (this.system as any).study
			.map((e: Study) => getAdjustedStudyHours(e))
			.reduce((partialSum: number, a: number) => partialSum + a, 0)
	}

	sameSection(compare: Item): boolean {
		const traits = [ItemType.Trait, ItemType.TraitContainer]
		const skills = [ItemType.Skill, ItemType.Technique, ItemType.SkillContainer]
		const spells = [ItemType.Spell, ItemType.RitualMagicSpell, ItemType.SpellContainer]
		const equipment = [ItemType.Equipment, ItemType.EquipmentContainer]
		const notes = [ItemType.Note, ItemType.NoteContainer]
		const sections = [traits, skills, spells, equipment, notes]
		for (const i of sections) {
			if (i.includes(this.type as any) && i.includes(compare.type as any)) return true
		}
		return false
	}

	exportSystemData(keepOther: boolean): any {
		const system: any = this.system
		system.name = this.name
		if (system.features)
			system.features = system.features.map((e: Feature) => {
				const { _levels: _, effective: __, ...rest } = e
				return rest
			})
		if ((this as any).children)
			system.children = (this as any).children.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).modifiers)
			system.modifiers = (this as any).modifiers.map((e: ItemGCS) => e.exportSystemData(false))
		if ((this as any).weapons)
			system.weapons = (this as any).weapons.map((e: BaseWeaponGURPS) => e.exportSystemData(false))
		if (!keepOther) delete system.other
		return system
	}
}
