import { EquipmentSystemData } from "@item/equipment/data"
import { EquipmentContainerSystemData } from "@item/equipment_container/data"
import { NoteSystemData } from "@item/note/data"
import { NoteContainerSystemData } from "@item/note_container/data"
import { RitualMagicSpellSystemData } from "@item/ritual_magic_spell/data"
import { SkillSystemData } from "@item/skill/data"
import { SkillContainerSystemData } from "@item/skill_container/data"
import { SpellSystemData } from "@item/spell/data"
import { SpellContainerSystemData } from "@item/spell_container/data"
import { TechniqueSystemData } from "@item/technique/data"
import { TraitSystemData } from "@item/trait/data"
import { TraitContainerSystemData } from "@item/trait_container/data"
import { AttributeObj } from "@module/attribute"
import { ActorType, DamageProgression, DisplayMode, SYSTEM_NAME } from "@module/data"
import { LengthUnits, LocalizeGURPS, WeightUnits } from "@util"
import { CharacterSystemData } from "./data"
import { CharacterSheetGURPS } from "./sheet"
import { ItemGURPS } from "@module/config"
import { ImportUtils } from "@util/import"
import { ActorFlags, BaseActorGURPS } from "@actor/base"

export interface CharacterImportedData extends Omit<CharacterSystemData, "attributes"> {
	traits: Array<TraitSystemData | TraitContainerSystemData>
	skills: Array<SkillSystemData | TechniqueSystemData | SkillContainerSystemData>
	spells: Array<SpellSystemData | RitualMagicSpellSystemData | SpellContainerSystemData>
	equipment: Array<EquipmentSystemData | EquipmentContainerSystemData>
	other_equipment: Array<EquipmentSystemData | EquipmentContainerSystemData>
	notes: Array<NoteSystemData | NoteContainerSystemData>
	attributes: Array<AttributeObj>
	third_party: any
}

export class CharacterImporter {
	version: number

	document?: Actor

	constructor(document?: Actor) {
		this.version = 4
		if (document) this.document = document
	}

	static showDialog() {
		setTimeout(async () => {
			new Dialog(
				{
					title: LocalizeGURPS.translations.gurps.system.library_import.title_character,
					content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/character-library-import.hbs`, {}),
					buttons: {
						import: {
							icon: '<i class="fas fa-file-import"></i>',
							label: LocalizeGURPS.translations.gurps.system.library_import.import,
							callback: async (html: HTMLElement | JQuery<HTMLElement>) => {
								const form = $(html).find("form")[0]
								const files = form.data.files as FileList
								if (!files.length)
									return ui.notifications?.error(
										LocalizeGURPS.translations.gurps.error.import.no_file
									)
								else {
									const actors: any[] = []
									for (const file of Array.from(files)) {
										const text = await readTextFromFile(file)
										actors.push({
											text: text,
											name: file.name,
											// @ts-expect-error path DOES exist on File
											path: file.path,
										})
									}
									CharacterImporter.importCompendium(actors)
								}
							},
						},
						no: {
							icon: '<i class="fas fa-times"></i>',
							label: LocalizeGURPS.translations.gurps.system.library_import.cancel,
						},
					},
					default: "import",
				},
				{
					width: 400,
				}
			).render(true)
		}, 200)
	}

	static async importCompendium(files: { text: string; name: string; path: string }[]) {
		const label = files[0].path.split(/\\|\//).at(-2)!
		const name = label?.slugify()

		let pack = game.packs.find(p => p.metadata.name === name)
		if (!pack) {
			pack = await CompendiumCollection.createCompendium({
				type: "Actor",
				label: label,
				name: name,
				package: "world",
				path: "",
				private: true,
			})
		}
		ui.notifications?.info(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.start, { name: name })
		)
		const importer = new CharacterImporter()
		const actors: Partial<CharacterSystemData>[] = []
		files.forEach(async file => {
			await importer.importData(file).then(actor => actors.push(actor))
		})

		let counter = files.length
		await BaseActorGURPS.createDocuments(actors as any[], {
			pack: pack.collection,
			keepId: true,
		})
		ui.notifications?.info(
			LocalizeGURPS.format(LocalizeGURPS.translations.gurps.system.library_import.finished, {
				number: counter,
			})
		)
	}

	static import(document: Actor, file: { text: string; name: string; path: string }) {
		const importer = new CharacterImporter(document)
		importer._import(file)
	}

	async _import(file: { text: string; name: string; path: string }) {
		const errorMessages: string[] = []
		// const json = file.text
		// let r: CharacterImportedData
		// const errorMessages: string[] = []
		// try {
		// 	r = JSON.parse(json)
		// } catch (err) {
		// 	console.error(err)
		// 	errorMessages.push(LocalizeGURPS.translations.gurps.error.import.no_json_detected)
		// 	return this.throwImportError(errorMessages)
		// }
		let commit: Partial<CharacterSystemData> = await this.importData(file, this.document)

		// let commit: Partial<CharacterSystemData> = {}
		// const imp = (document as any).importData
		// imp.name = file.name ?? imp.name
		// imp.path = file.path ?? imp.path
		// imp.last_import = new Date().toISOString()
		// try {
		// 	if (r.version < this.version)
		// 		return this.throwImportError([
		// 			...errorMessages,
		// 			LocalizeGURPS.translations.gurps.error.import.format_old,
		// 		])
		// 	else if (r.version > this.version)
		// 		return this.throwImportError([
		// 			...errorMessages,
		// 			LocalizeGURPS.translations.gurps.error.import.format_new,
		// 		])
		// 	if (this.document?.type === ActorType.LegacyCharacter) {
		// 		commit = { ...commit, ...{ type: ActorType.Character } }
		// 	}
		// 	commit = { ...commit, ...{ "system.import": imp } }
		// 	commit = { ...commit, ...{ name: r.profile.name, "prototypeToken.name": r.profile.name } }
		// 	commit = { ...commit, ...this.importMiscData(r) }
		// 	commit = { ...commit, ...(await this.importProfile(r.profile)) }
		// 	commit = { ...commit, ...this.importSettings(r.settings) }
		// 	commit = { ...commit, ...this.importAttributes(r.attributes) }
		// 	commit = { ...commit, ...this.importResourceTrackers(r.third_party) }

		// 	// Begin item import
		// 	const items: Array<ItemGURPS> = []
		// 	items.push(...ImportUtils.importItems(r.traits))
		// 	items.push(...ImportUtils.importItems(r.skills))
		// 	items.push(...ImportUtils.importItems(r.spells))
		// 	items.push(...ImportUtils.importItems(r.equipment))
		// 	items.push(...ImportUtils.importItems(r.other_equipment, { container: null, other: true, sort: 0 }))
		// 	items.push(...ImportUtils.importItems(r.notes))
		// 	commit = { ...commit, ...{ items: items } }
		// } catch (err) {
		// 	console.error(err)
		// 	errorMessages.push(
		// 		LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.generic, {
		// 			name: r.profile.name,
		// 			message: (err as Error).message,
		// 		})
		// 	)
		// 	return this.throwImportError(errorMessages)
		// }

		try {
			if (this.document?.isToken) {
				await this.document.deleteEmbeddedDocuments("Item", [...this.document.items.keys()], { render: false })
			}
			await this.document?.update(commit, {
				diff: false,
				recursive: false,
			})
			if ((this.document?.sheet as unknown as CharacterSheetGURPS)?.config !== null) {
				;(this.document?.sheet as unknown as CharacterSheetGURPS)?.config?.render(true)
			}
		} catch (err) {
			console.error(err)
			errorMessages.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.generic, {
					name: commit.profile?.name || LocalizeGURPS.translations.TYPES.Actor.character_gcs,
					message: (err as Error).message,
				})
			)
			return this.throwImportError(errorMessages)
		}
		return true
	}

	async importData(
		file: { text: string; name: string; path: string },
		document?: Actor
	): Promise<Partial<CharacterSystemData>> {
		const json = file.text
		let r: CharacterImportedData
		const errorMessages: string[] = []
		try {
			r = JSON.parse(json)
		} catch (err) {
			console.error(err)
			errorMessages.push(LocalizeGURPS.translations.gurps.error.import.no_json_detected)
			return this.throwImportError(errorMessages)
		}

		let commit: Partial<CharacterSystemData> = {}
		const imp = (document as any)?.importData ?? { name: "", path: "", last_import: "" }
		imp.name = file.name ?? imp.name
		imp.path = file.path ?? imp.path
		imp.last_import = new Date().toISOString()
		try {
			if (r.version < this.version)
				this.throwImportError([...errorMessages, LocalizeGURPS.translations.gurps.error.import.format_old])
			else if (r.version > this.version)
				this.throwImportError([...errorMessages, LocalizeGURPS.translations.gurps.error.import.format_new])
			if (this.document?.type === ActorType.LegacyCharacter) {
				commit = { ...commit, ...{ type: ActorType.Character } }
			}
			commit = {
				...commit,
				...{
					"system.import": imp,
					type: ActorType.Character,
					flags: {
						[SYSTEM_NAME]: {
							[ActorFlags.AutoThreshold]: { active: true },
							[ActorFlags.AutoEncumbrance]: { active: true },
						},
					},
				},
			}
			commit = {
				...commit,
				...{
					name: r.profile.name ?? LocalizeGURPS.translations.TYPES.Actor.character_gcs,
					"prototypeToken.name": r.profile.name ?? LocalizeGURPS.translations.TYPES.Actor.character_gcs,
				},
			}
			commit = { ...commit, ...this.importMiscData(r) }
			commit = { ...commit, ...(await this.importProfile(r.profile)) }
			commit = { ...commit, ...this.importSettings(r.settings) }
			commit = { ...commit, ...this.importAttributes(r.attributes) }
			commit = { ...commit, ...this.importResourceTrackers(r.third_party) }

			// Begin item import
			const items: Array<ItemGURPS> = []
			items.push(...ImportUtils.importItems(r.traits))
			items.push(...ImportUtils.importItems(r.skills))
			items.push(...ImportUtils.importItems(r.spells))
			items.push(...ImportUtils.importItems(r.equipment))
			items.push(...ImportUtils.importItems(r.other_equipment, { container: null, other: true, sort: 0 }))
			items.push(...ImportUtils.importItems(r.notes))
			commit = { ...commit, ...{ items: items } }
		} catch (err) {
			console.error(err)
			errorMessages.push(
				LocalizeGURPS.format(LocalizeGURPS.translations.gurps.error.import.generic, {
					name: r.profile.name,
					message: (err as Error).message,
				})
			)
			return this.throwImportError(errorMessages)
		}
		return commit
	}

	importMiscData(data: CharacterImportedData) {
		return {
			"system.version": data.version,
			"system.id": data.id,
			"system.created_date": data.created_date,
			"system.modified_date": data.modified_date,
			"system.total_points": data.total_points,
			"system.points_record": data.points_record || [],
		}
	}

	async importProfile(profile: CharacterImportedData["profile"]) {
		const r: any = {
			"system.profile.player_name": profile.player_name || "",
			"system.profile.name": profile.name || this.document?.name,
			"system.profile.title": profile.title || "",
			"system.profile.organization": profile.organization || "",
			"system.profile.age": profile.age || "",
			"system.profile.birthday": profile.birthday || "",
			"system.profile.eyes": profile.eyes || "",
			"system.profile.hair": profile.hair || "",
			"system.profile.skin": profile.skin || "",
			"system.profile.handedness": profile.handedness || "",
			"system.profile.height": profile.height || "",
			"system.profile.weight": profile.weight,
			"system.profile.SM": profile.SM || 0,
			"system.profile.gender": profile.gender || "",
			"system.profile.tech_level": profile.tech_level || "",
			"system.profile.religion": profile.religion || "",
		}

		if (profile.portrait) {
			if (game.user?.hasPermission("FILES_UPLOAD")) {
				r.img = `data:image/png;base64,${profile.portrait}.png`
			} else {
				console.error(LocalizeGURPS.translations.gurps.error.import.portrait_permissions)
				ui.notifications?.error(LocalizeGURPS.translations.gurps.error.import.portrait_permissions)
			}
		}
		return r
	}

	importSettings(settings: CharacterImportedData["settings"]) {
		return {
			"system.settings.default_length_units": settings.default_length_units ?? LengthUnits.FeetAndInches,
			"system.settings.default_weight_units": settings.default_weight_units ?? WeightUnits.Pound,
			"system.settings.user_description_display": settings.user_description_display ?? DisplayMode.Tooltip,
			"system.settings.modifiers_display": settings.modifiers_display ?? DisplayMode.Inline,
			"system.settings.notes_display": settings.notes_display ?? DisplayMode.Inline,
			"system.settings.skill_level_adj_display": settings.skill_level_adj_display ?? DisplayMode.Tooltip,
			"system.settings.use_multiplicative_modifiers": settings.use_multiplicative_modifiers ?? false,
			"system.settings.use_modifying_dice_plus_adds": settings.use_modifying_dice_plus_adds ?? false,
			"system.settings.damage_progression": settings.damage_progression ?? DamageProgression.BasicSet,
			"system.settings.show_trait_modifier_adj": settings.show_trait_modifier_adj ?? false,
			"system.settings.show_equipment_modifier_adj": settings.show_equipment_modifier_adj ?? false,
			"system.settings.show_spell_adj": settings.show_spell_adj ?? false,
			"system.settings.use_title_in_footer": settings.use_title_in_footer ?? false,
			"system.settings.exclude_unspent_points_from_total": settings.exclude_unspent_points_from_total ?? false,
			"system.settings.page": settings.page,
			"system.settings.block_layout": settings.block_layout,
			"system.settings.attributes": settings.attributes,
			"system.settings.resource_trackers": [],
			"system.settings.body_type": settings.body_type,
		}
	}

	importAttributes(attributes: AttributeObj[]) {
		return {
			"system.attributes": attributes,
		}
	}

	importResourceTrackers(tp: any) {
		if (!tp) return
		return {
			"system.settings.resource_trackers": tp.settings?.resource_trackers ?? [],
			"system.resource_trackers": tp.resource_trackers ?? [],
		}
	}

	async throwImportError(msg: string[]) {
		ui.notifications?.error(msg.join("<br>"))

		await ChatMessage.create({
			content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/chat/character-import-error.hbs`, {
				lines: msg,
			}),
			user: game.user!.id,
			type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
			whisper: [game.user!.id],
		})
		return {}
	}
}
