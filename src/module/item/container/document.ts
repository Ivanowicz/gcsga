import { BaseItemGURPS, ItemFlags } from "@item/base"
import { ItemGURPS } from "@module/config"
import { ItemType, SYSTEM_NAME } from "@module/data"
import { AnyDocumentData } from "types/foundry/common/abstract/data.mjs"
import Document, { Metadata } from "types/foundry/common/abstract/document.mjs"
import EmbeddedCollection from "types/foundry/common/abstract/embedded-collection.mjs"
import { DocumentConstructor } from "types/types/helperTypes"
import { BaseContainerSystemData } from "./data"

export abstract class ContainerGURPS extends BaseItemGURPS {
	readonly system!: BaseContainerSystemData

	items: foundry.utils.Collection<BaseItemGURPS> = new Collection()

	// Getters
	get deepItems(): Collection<Item> {
		const deepItems: Item[] = []
		if (this.items)
			for (const item of this.items) {
				deepItems.push(item)
				if (item instanceof ContainerGURPS) for (const i of item.deepItems) deepItems.push(i)
			}
		return new Collection(
			deepItems.map(e => {
				return [e.id!, e]
			})
		)
	}

	// Embedded Items
	get children(): Collection<ItemGURPS> {
		const childTypes = CONFIG.GURPS.Item.childTypes[this.type]
		return new Collection(
			this.items
				.filter(item => childTypes.includes(item.type))
				.map(item => {
					return [item.id!, item]
				})
		) as Collection<ItemGURPS>
	}

	get open(): boolean {
		return (this.system as any).open
	}

	async createEmbeddedDocuments(
		embeddedName: string,
		data: Array<Record<string, any>>,
		context?: DocumentModificationContext & any
	): Promise<StoredDocument<any>> {
		if (embeddedName !== "Item") return super.createEmbeddedDocuments(embeddedName, data, context)
		if (!Array.isArray(data)) data = [data]

		// Prevent creating embeded documents which this type of container shouldn't contain
		data = data.filter(e => CONFIG.GURPS.Item.allowedContents[this.type].includes(e.type))

		if (data.length)
			for (const itemData of data) {
				itemData.flags ??= {}
				setProperty(itemData.flags, `${SYSTEM_NAME}.${ItemFlags.Container}`, this.id)
			}

		return this.actor?.createEmbeddedDocuments("Item", data)
	}

	getEmbeddedDocument(
		embeddedName: string,
		id: string,
		options?: { strict?: boolean | undefined } | undefined
	): Document<any, any, Metadata<any>> | undefined {
		if (embeddedName !== "Item") return super.getEmbeddedDocument(embeddedName, id, options)
		return this.items.get(id)
	}

	async deleteEmbeddedDocuments(
		embeddedName: string,
		ids: string[],
		context?: DocumentModificationContext | undefined
	): Promise<any> {
		if (embeddedName !== "Item") return super.deleteEmbeddedDocuments(embeddedName, ids, context)

		const deletedItems = this.items.filter(e => ids.includes(e.id!))
		await this.parent?.deleteEmbeddedDocuments(embeddedName, ids, context)
		return deletedItems
	}

	getEmbeddedCollection(embeddedName: string): EmbeddedCollection<DocumentConstructor, AnyDocumentData> {
		if (embeddedName === "Item") return this.items as any
		return super.getEmbeddedCollection(embeddedName)
	}

	prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments()
		let container = null
		if (!this.actor && !this.pack) return
		this.items = new Collection()
		if (this.actor) {
			container = this.actor.items as EmbeddedCollection<typeof BaseItemGURPS, any>
			for (const item of container.filter(
				(e: BaseItemGURPS) => e.getFlag(SYSTEM_NAME, ItemFlags.Container) === this.id
			)) {
				if (this.type === ItemType.EquipmentContainer && item.type === ItemType.Equipment) {
					;(item as any).system.other = (this.system as any).other
				}
				this.items.set(item.id!, item)
			}
		} else if (this.pack) {
			if (!this.compendium.indexed) this.compendium.getIndex()
			container = this.compendium.index
			for (const i of container.filter(
				(e: any) =>
					!!e.flags?.[SYSTEM_NAME]?.[ItemFlags.Container] &&
					e.flags[SYSTEM_NAME][ItemFlags.Container] === this.id
			)) {
				const item = fromUuidSync(i.uuid) as BaseItemGURPS
				this.items.set(item._id, item)
			}
		}
	}
}
