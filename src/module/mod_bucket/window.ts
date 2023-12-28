import { HooksGURPS, RollModifier, RollModifierStack, SYSTEM_NAME, UserFlags } from "@module/data"
import { ModifierBucket } from "./button"
import { PDF } from "@module/pdf"
import { LocalizeGURPS } from "@util"

export class ModifierBucketWindow extends Application {


	refresh = foundry.utils.debounce(this.render, 100)

	// Common mod categories currently open
	stacksOpen: boolean[] = []

	stackEditing: number = -1

	categoriesOpen: boolean[] = Array(10).fill(false)

	// Current value of text input field
	value = ""

	parent: ModifierBucket

	constructor(parent: ModifierBucket) {
		super()
		this.parent = parent
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			template: `systems/${SYSTEM_NAME}/templates/modifier-bucket/window.hbs`,
			popOut: false,
			minimiazable: false,
			resizable: false,
			id: "ModifierBucket",
			scrollY: ["#categories .content"]
		})
	}


	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html)

		// Get position
		const button = $("#modifier-bucket-button")
		const buttonTop = button.position()?.top ?? 0
		const buttonLeft = (button.position()?.left || 0) + 220 ?? 0
		let buttonWidth = parseFloat(button.css("width").replace("px", ""))
		const width = html.width() || 640
		let height = parseFloat(html.css("height").replace("px", ""))
		let left = Math.max(buttonLeft + buttonWidth / 2 - width / 2, 10)
		html.css("left", `${left}px`)
		html.css("top", `${buttonTop - height - 10}px`)

		// Focus the textbox on show
		const searchbar = html.find(".searchbar")
		searchbar.trigger("focus")

		// Detect changes to input
		// searchbar.on("keydown", event => this._keyDown(event))

		// Modifier Deleting
		// html.find(".active").on("click", event => this.removeModifier(event))
		// html.find(".player").on("click", event => this.sendToPlayer(event))
		// html.find(".modifier").on("click", event => this._onClickModifier(event))
		html.find(".collapsible").on("click", event => this._onCollapseToggle(event))
		html.find(".ref").on("click", event => PDF.handle(event))

		// Save Current Bucket
		html.find("#save-current").on("click", event => this._onSaveCurrentStack(event))
		html.find("#stacks #dropdown-toggle").on("click", event => this._onStackCollapseToggle(event))
		html.find("#stacks .apply").on("click", event => this._onApplyStack(event))
		html.find("#stacks .apply").on("click", event => this._onApplyStack(event))
		html.find("#stacks .delete").on("click", event => this._onDeleteStack(event))
		html.find("#stacks .name").on("dblclick", event => this._onEditToggleStack(event))
		html.find("#stacks input").on("change", event => this._onEditStack(event))
	}

	private async _onCollapseToggle(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		const index = parseInt($(event.currentTarget).find(".dropdown-toggle").data("index"))
		this.categoriesOpen[index] = !this.categoriesOpen[index]
		return this.render()
	}

	private async _onStackCollapseToggle(event: JQuery.ClickEvent): Promise<unknown> {
		event.preventDefault()
		console.log("what")
		const savedStacks = game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[] ?? []
		const stacks = this.stacksOpen
		stacks.push(...Array(savedStacks.length - stacks.length).fill(false))
		const index = parseInt(event.currentTarget.dataset.index)
		stacks[index] = !this.stacksOpen[index]
		this.stacksOpen = stacks
		return this.render()
	}

	private async _onSaveCurrentStack(event: JQuery.ClickEvent): Promise<boolean> {
		event.preventDefault()
		const modStack = game.user.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) as RollModifier[]
		const savedStacks = game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[] ?? []
		savedStacks.push({
			title: LocalizeGURPS.translations.gurps.system.modifier_bucket.untitled_stack,
			items: modStack
		})
		await game.user.setFlag(SYSTEM_NAME, UserFlags.SavedStacks, savedStacks)
		return Hooks.call(HooksGURPS.AddModifier)
	}

	private async _onApplyStack(event: JQuery.ClickEvent): Promise<boolean> {
		event.preventDefault()
		const index = event.currentTarget.dataset.index
		const savedStacks = game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[] ?? []
		await game.user.setFlag(SYSTEM_NAME, UserFlags.ModifierStack, savedStacks[index].items)
		return Hooks.call(HooksGURPS.AddModifier)
	}

	private async _onEditToggleStack(event: JQuery.DoubleClickEvent): Promise<boolean> {
		event.preventDefault()
		const index = parseInt(event.currentTarget.dataset.index)
		this.stackEditing = this.stackEditing === index ? -1 : index
		return Hooks.call(HooksGURPS.AddModifier)
	}

	private async _onDeleteStack(event: JQuery.ClickEvent): Promise<boolean> {
		event.preventDefault()
		const index = event.currentTarget.dataset.index
		const savedStacks = game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[] ?? []
		savedStacks.splice(index, 1)
		await game.user.setFlag(SYSTEM_NAME, UserFlags.SavedStacks, savedStacks)
		return Hooks.call(HooksGURPS.AddModifier)
	}

	private async _onEditStack(event: JQuery.ChangeEvent) {
		const index = parseInt(event.currentTarget.dataset.index)
		const savedStacks = game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[] ?? []
		savedStacks[index].title = $(event.currentTarget).val()
		await game.user.setFlag(SYSTEM_NAME, UserFlags.SavedStacks, savedStacks)
		this.stackEditing = -1
		// return this.refresh()
		// return Hooks.call(HooksGURPS.AddModifier)
	}

	getData(options?: Partial<ApplicationOptions> | undefined): MaybePromise<object> {
		const modStack = game.user.getFlag(SYSTEM_NAME, UserFlags.ModifierStack) ?? []
		const savedStacks = game.user.getFlag(SYSTEM_NAME, UserFlags.SavedStacks) as RollModifierStack[] ?? []

		const commonMods = CONFIG.GURPS.commonMods

		commonMods.forEach((e: any, i: number) => {
			e.open = this.categoriesOpen[i]
		})

		savedStacks.forEach((e: any, i: number) => {
			e.editing = this.stackEditing === i
			e.open = this.stacksOpen[i]
		})

		const genericMods = [-5, -4, -3, -2, -1, +1, +2, +3, +4, +5].map(e => {
			return { modifier: e }
		})

		const players = game.users ?? []

		return mergeObject(super.getData(options), {
			value: this.value,
			stackEditing: this.stackEditing,
			players,
			commonMods,
			genericMods,
			savedStacks,
			meleeMods: CONFIG.GURPS.meleeMods,
			rangedMods: CONFIG.GURPS.rangedMods,
			defenseMods: CONFIG.GURPS.defenseMods,
			currentMods: modStack,
		})
	}

	render(force?: boolean | undefined, options?: Application.RenderOptions<ApplicationOptions> | undefined): unknown {
		return super.render(force, options)
	}
}
