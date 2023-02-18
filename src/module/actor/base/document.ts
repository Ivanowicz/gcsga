import { RollModifier, SYSTEM_NAME } from "@module/data"
import {
	ConditionGURPS,
	ConditionID,
	EffectGURPS,
	EffectID,
	ManeuverID,
	Postures,
	TraitContainerGURPS,
	TraitGURPS,
	TraitModifierGURPS,
} from "@item"
import {
	ActorConstructorContextGURPS,
	ActorFlags,
	ActorFlagsGURPS,
	ActorSystemData,
	BaseActorSourceGURPS,
} from "./data"
import { HitLocationTable } from "@actor/character/hit_location"
import {
	DamageRoll,
	DamageRollAdapter,
	DamageTarget,
	HitPointsCalc,
	TargetTrait,
	TargetTraitModifier,
} from "@module/damage_calculator"
import { ApplyDamageDialog } from "@module/damage_calculator/apply_damage_dlg"
import { DamagePayload } from "@module/damage_calculator/damage_chat_message"
import { DiceGURPS } from "@module/dice"
import { ActorDataGURPS, ActorSourceGURPS, ItemGURPS } from "@module/config"
import Document, { DocumentModificationOptions, Metadata } from "types/foundry/common/abstract/document.mjs"
import { BaseUser } from "types/foundry/common/documents.mjs"
import { Attribute } from "@module/attribute"

// @ts-ignore
class BaseActorGURPS extends Actor {
	constructor(data: ActorSourceGURPS, context: ActorConstructorContextGURPS = {}) {
		if (context.gurps?.ready) {
			super(data, context)
			this.noPrepare = false
		} else {
			mergeObject(context, { gurps: { ready: true } })
			const ActorConstructor = CONFIG.GURPS.Actor.documentClasses[data.type]
			if (ActorConstructor) return new ActorConstructor(data, context)
			throw Error(`Invalid Actor Type "${data.type}"`)
		}
	}

	protected async _preCreate(data: any, options: DocumentModificationOptions, user: BaseUser): Promise<void> {
		if (this._source.img === foundry.CONST.DEFAULT_TOKEN)
			this._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type}.svg`
		await super._preCreate(data, options, user)
	}

	protected async _preUpdate(
		changed: DeepPartial<ActorDataGURPS>,
		options: DocumentModificationOptions,
		user: BaseUser
	): Promise<void> {
		const defaultToken = `systems/${SYSTEM_NAME}/assets/icons/${this.type}.svg`
		if (changed.img && !(changed as any).prototypeToken?.texture?.src) {
			if (
				!(this as any).prototypeToken.texture.src ||
				(this as any).prototypeToken.texture.src === defaultToken
			) {
				setProperty(changed, "prototypeToken.texture.src", changed.img)
			} else {
				setProperty(changed, "prototypeToken.texture.src", (this as any).prototypeToken.texture.src)
			}
		}
		await super._preUpdate(changed, options, user)
	}

	get hitLocationTable(): HitLocationTable {
		return {
			name: "",
			roll: new DiceGURPS("3d6"),
			locations: [],
		}
	}

	get deepItems(): Collection<ItemGURPS> {
		const deepItems: ItemGURPS[] = []
		for (const item of this.items as any as Collection<ItemGURPS>) {
			deepItems.push(item)
			if ((item as any).items)
				for (const i of (item as any).deepItems) {
					deepItems.push(i)
				}
		}
		return new Collection(
			deepItems.map(e => {
				return [e.id!, e]
			})
		)
	}

	get gEffects(): Collection<EffectGURPS> {
		const effects: Collection<EffectGURPS> = new Collection()
		for (const item of this.deepItems) {
			if (item instanceof EffectGURPS) effects.set(item._id, item)
		}
		return effects
	}

	get conditions(): Collection<ConditionGURPS> {
		const conditions: Collection<ConditionGURPS> = new Collection()
		for (const item of this.deepItems) {
			if (item instanceof ConditionGURPS) conditions.set(item._id, item)
		}
		return conditions
	}

	get modifiers(): RollModifier[] {
		let modifiers: RollModifier[] = []
		this.gEffects.forEach(e => {
			modifiers = modifiers.concat(e.system.modifiers || [])
		})
		return modifiers
	}

	override get temporaryEffects(): any {
		const conditions = this.conditions.map(e => new ActiveEffect({ icon: e.img || "" }))
		return super.temporaryEffects.concat(conditions)
	}

	updateEmbeddedDocuments(
		embeddedName: string,
		updates?: Record<string, unknown>[] | undefined,
		context?: DocumentModificationContext | undefined
	): Promise<Document<any, this, Metadata<any>>[]> {
		return super.updateEmbeddedDocuments(embeddedName, updates, context)
	}

	get sizeMod(): number {
		return 0
	}

	prepareDerivedData(): void {
		super.prepareDerivedData()
		setProperty(this.flags, `${SYSTEM_NAME}.${ActorFlags.SelfModifiers}`, [])
		setProperty(this.flags, `${SYSTEM_NAME}.${ActorFlags.TargetModifiers}`, [])

		const sizemod = this.sizeMod
		if (sizemod !== 0) {
			this.flags[SYSTEM_NAME][ActorFlags.TargetModifiers].push({
				name: "for Size Modifier",
				modifier: sizemod,
				tags: [],
			})
		}
	}

	handleDamageDrop(payload: DamagePayload): void {
		let roll: DamageRoll = new DamageRollAdapter(payload)
		let target: DamageTarget = new DamageTargetActor(this)
		ApplyDamageDialog.create(roll, target).then(dialog => dialog.render(true))
	}

	createDamageTargetAdapter(): DamageTarget {
		return new DamageTargetActor(this)
	}

	hasCondition(id: ConditionID): boolean {
		return this.conditions.some(e => e.cid === id)
	}

	async increaseCondition(id: EffectID): Promise<ConditionGURPS | null> {
		if (Object.values(ManeuverID).includes(id as any)) return this.changeManeuver(id as ManeuverID)
		const existing = this.conditions.find(e => e.cid === id)
		if (existing) {
			if (existing.canLevel) {
				const newLevel = existing.level + 1
				if (newLevel <= existing.maxLevel) {
					await existing.update({ "system.levels.current": newLevel })
				}
				return existing
			} else {
				await existing.delete()
				return null
			}
		}
		const newCondition = duplicate(ConditionGURPS.getData(id))
		if (newCondition.system?.can_level) newCondition.system.levels!.current += 1
		const items = (await this.createEmbeddedDocuments("Item", [newCondition])) as ConditionGURPS[]
		return items[0]
	}

	async decreaseCondition(id: EffectID, { forceRemove } = { forceRemove: false }): Promise<void> {
		const condition = this.conditions.find(e => e.cid === id)
		if (!condition) return

		const value = condition.canLevel ? Math.max(condition.level - 1, 0) : null
		if (value && !forceRemove) {
			await condition.update({ "system.levels.current": value })
		} else {
			await condition.delete()
		}
	}

	async changeManeuver(id: ManeuverID | "none"): Promise<ConditionGURPS | null> {
		const existing = this.conditions.find(e => e.cid === id)
		if (existing) return null
		if (id === "none") return this.resetManeuvers()
		if ([ManeuverID.BLANK_1, ManeuverID.BLANK_2].includes(id as any)) return null
		const maneuvers = this.conditions.filter(e => Object.values(ManeuverID).includes(e.cid as any))
		const newCondition = duplicate(ConditionGURPS.getData(id))
		if (maneuvers.length) {
			const items = (await this.updateEmbeddedDocuments("Item", [
				{ _id: maneuvers[0]._id, ...newCondition },
			])) as unknown as ConditionGURPS[]
			return items[0]
		}
		const items = (await this.createEmbeddedDocuments("Item", [newCondition])) as ConditionGURPS[]
		return items[0]
	}

	async resetManeuvers(): Promise<null> {
		const maneuvers = this.conditions.filter(e => Object.values(ManeuverID).includes(e.cid as any))
		await this.deleteEmbeddedDocuments(
			"Item",
			maneuvers.map(e => e.id!)
		)
		return null
	}

	async changePosture(id: ConditionID | "standing"): Promise<ConditionGURPS | null> {
		const existing = this.conditions.find(e => e.cid === id)
		if (existing) return null
		if (id === "standing") return this.resetPosture()
		const postures = this.conditions.filter(e => Postures.includes(e.cid as any))
		const newCondition = duplicate(ConditionGURPS.getData(id))
		if (postures.length) {
			const items = this.updateEmbeddedDocuments("Item", [
				{ _id: postures[0]._id, ...newCondition },
			]) as unknown as ConditionGURPS[]
			return items[0]
		}
		const items = (await this.createEmbeddedDocuments("Item", [newCondition])) as ConditionGURPS[]
		return items[0]
	}

	async resetPosture(): Promise<null> {
		const maneuvers = this.conditions.filter(e => Object.values(Postures).includes(e.cid as any))
		await this.deleteEmbeddedDocuments(
			"Item",
			maneuvers.map(e => e.id!)
		)
		return null
	}
}

/**
 * Adapt a BaseActorGURPS to the DamageTarget interface expected by the Damage Calculator.
 */
class DamageTargetActor implements DamageTarget {
	static DamageReduction = "Damage Reduction"

	private actor: BaseActorGURPS

	constructor(actor: BaseActorGURPS) {
		this.actor = actor
	}

	get name(): string {
		return this.actor.name ?? ""
	}

	get ST(): number {
		// @ts-ignore
		return this.actor.attributes.get("st")?.calc.value
	}

	get hitPoints(): HitPointsCalc {
		// @ts-ignore
		return this.actor.attributes.get("hp")?.calc
	}

	get hitLocationTable(): HitLocationTable {
		return this.actor.hitLocationTable
	}

	/**
	 * This is where we would add special handling to look for traits under different names.
	 *  Actor
	 *  .traits.contents.find(it => it.name === 'Damage Resistance')
	 *	 .modifiers.contents.filter(it => it.enabled === true).find(it => it.name === 'Hardened')
	 * @param name
	 */
	getTrait(name: string): TargetTrait | undefined {
		if (this.actor instanceof BaseActorGURPS) {
			let traits = this.actor.traits.contents.filter(it => it instanceof TraitGURPS)
			let found = traits.find(it => it.name === name)
			return found ? new TraitAdapter(found as TraitGURPS) : undefined
		}
		return undefined
	}

	hasTrait(name: string): boolean {
		return !!this.getTrait(name)
	}

	get isUnliving(): boolean {
		// Try "Injury Tolerance (Unliving)" and "Unliving"
		if (this.hasTrait("Unliving")) return true
		if (!this.hasTrait("Injury Tolerance")) return false
		let trait = this.getTrait("Injury Tolerance")
		return !!trait?.getModifier("Unliving")
	}

	get isHomogenous(): boolean {
		if (this.hasTrait("Homogenous")) return true
		if (!this.hasTrait("Injury Tolerance")) return false
		let trait = this.getTrait("Injury Tolerance")
		return !!trait?.getModifier("Homogenous")
	}

	get isDiffuse(): boolean {
		if (this.hasTrait("Diffuse")) return true
		if (!this.hasTrait("Injury Tolerance")) return false
		let trait = this.getTrait("Injury Tolerance")
		return !!trait?.getModifier("Diffuse")
	}
}

/**
 * Adapt a TraitGURPS to the TargetTrait interface expected by the Damage Calculator.
 */
class TraitAdapter implements TargetTrait {
	private trait: TraitGURPS

	// Actor
	//  .traits.contents.find(it => it.name === 'Damage Resistance')
	//  .modifiers.contents.filter(it => it.enabled === true).find(it => it.name === 'Hardened')

	getModifier(name: string): TraitModifierAdapter | undefined {
		return this.modifiers?.find(it => it.name === name)
	}

	get levels() {
		return this.trait.levels
	}

	get name() {
		return this.trait.name
	}

	get modifiers(): TraitModifierAdapter[] {
		return this.trait.modifiers.contents
			.filter(it => it instanceof TraitModifierGURPS)
			.filter(it => it.enabled === true)
			.map(it => new TraitModifierAdapter(it as TraitModifierGURPS))
	}

	constructor(trait: TraitGURPS) {
		this.trait = trait
	}
}

/**
 * Adapt the TraitModifierGURPS to the interface expected by Damage calculator.
 */
class TraitModifierAdapter implements TargetTraitModifier {
	private modifier: TraitModifierGURPS

	get levels() {
		return this.modifier.levels
	}

	get name(): string {
		return this.modifier.name!
	}

	constructor(modifier: TraitModifierGURPS) {
		this.modifier = modifier
	}
}

// @ts-ignore
interface BaseActorGURPS extends Actor {
	flags: ActorFlagsGURPS
	noPrepare: boolean
	deepItems: Collection<ItemGURPS>
	attributes: Map<string, Attribute>
	traits: Collection<TraitGURPS | TraitContainerGURPS>
	// Temp
	system: ActorSystemData
	_source: BaseActorSourceGURPS
	_id: string
}

export { BaseActorGURPS }
