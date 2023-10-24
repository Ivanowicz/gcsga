import { Context } from "types/foundry/common/abstract/document.mjs"
import { SETTINGS, SYSTEM_NAME } from "@module/data"
import { PDFViewerSheet } from "./sheet"
import { PDFEditorSheet } from "./edit"

// @ts-ignore
interface EntryPageConstructorContextGURPS extends Context<JournalEntryPage> {
	gurps?: {
		ready?: boolean
	}
}

// @ts-ignore
export class JournalEntryPageGURPS extends JournalEntryPage {
	system!: {
		offset: number
		code: string
	}

	constructor(data: any, context: EntryPageConstructorContextGURPS = {}) {
		if (context.gurps?.ready) {
			super(data, context)
			this.system.code ??= ""
			this.system.offset ??= 0
		} else {
			mergeObject(context, { gurps: { ready: true } })
			if (data.type === "pdf") return new JournalEntryPageGURPS(data, context)
			// @ts-ignore
			else return new JournalEntryPage(data, context)
		}
	}
}

const SJG_links = {
	ACT1: "https://warehouse23.com/products/gurps-action-1-heroes",
	ACT3: "https://warehouse23.com/products/gurps-action-3-furious-fists",
	B: "https://warehouse23.com/products/gurps-basic-set-characters-and-campaigns",
	BX: "https://warehouse23.com/products/gurps-basic-set-characters-and-campaigns",
	BS: "https://warehouse23.com/products/gurps-banestorm",
	DF1: "https://warehouse23.com/products/gurps-dungeon-fantasy-1-adventurers-1",
	DF3: "https://warehouse23.com/products/gurps-dungeon-fantasy-3-the-next-level-1",
	DF4: "https://warehouse23.com/products/gurps-dungeon-fantasy-4-sages-1",
	DF8: "https://warehouse23.com/products/gurps-dungeon-fantasy-8-treasure-tables",
	DF11: "https://warehouse23.com/products/gurps-dungeon-fantasy-11-power-ups",
	DF12: "https://warehouse23.com/products/gurps-dungeon-fantasy-12-ninja",
	DF13: "https://warehouse23.com/products/gurps-dungeon-fantasy-13-loadouts",
	DF14: "https://warehouse23.com/products/gurps-dungeon-fantasy-14-psi",
	DFM1: "https://warehouse23.com/products/gurps-dungeon-fantasy-monsters-1",
	DFA: "https://warehouse23.com/products/dungeon-fantasy-roleplaying-game",
	DFM: "https://warehouse23.com/products/dungeon-fantasy-roleplaying-game",
	DFS: "https://warehouse23.com/products/dungeon-fantasy-roleplaying-game",
	DFX: "https://warehouse23.com/products/dungeon-fantasy-roleplaying-game", // GCS standard DFRPG Exploits
	DFE: "https://warehouse23.com/products/dungeon-fantasy-roleplaying-game", // Old GCS standard DFRPG Exploits
	DR: "https://warehouse23.com/products/gurps-dragons-1",
	F: "https://warehouse23.com/products/gurps-fantasy",
	FDG: "https://gaming-ballistic.myshopify.com/collections/all-products/products/fantastic-dungeon-grappling",
	GUL: "https://www.gamesdiner.com/gulliver/",
	H: "https://warehouse23.com/products/gurps-horror-1",
	HF: "https://www.mygurps.com/historical_folks_4e.pdf",
	HT: "https://warehouse23.com/products/gurps-high-tech-2",
	IW: "https://warehouse23.com/products/gurps-infinite-worlds-1",
	LT: "https://warehouse23.com/products/gurps-fourth-edition-low-tech",
	LTC1: "https://warehouse23.com/products/gurps-low-tech-companion-1-philosophers-and-kings",
	LTIA: "https://warehouse23.com/products/gurps-low-tech-instant-armor",
	LITE: "https://warehouse23.com/products/gurps-lite-fourth-edition",
	M: "https://warehouse23.com/products/gurps-magic-5",
	MPS: "https://warehouse23.com/products/gurps-magic-plant-spells",
	MA: "https://warehouse23.com/products/gurps-martial-arts",
	MAFCCS: "https://warehouse23.com/products/gurps-martial-arts-fairbairn-close-combat-systems",
	MATG: "https://warehouse23.com/products/gurps-martial-arts-technical-grappling",
	MH1: "https://warehouse23.com/products/gurps-monster-hunters-1-champions",
	MYST: "https://warehouse23.com/products/gurps-mysteries-1",
	MYTH: "https://www.sjgames.com/gurps/books/myth/",
	P: "https://warehouse23.com/products/gurps-powers",
	PDF: "https://warehouse23.com/products/gurps-powers-divine-favor",
	PSI: "https://warehouse23.com/products/gurps-psionic-powers",
	PU1: "https://warehouse23.com/products/gurps-power-ups-1-imbuements-1",
	PU2: "https://warehouse23.com/products/gurps-power-ups-2-perks",
	PU3: "https://warehouse23.com/products/gurps-power-ups-3-talents",
	"PY#": "https://warehouse23.com/collections/pyramid",
	RSWL: "https://warehouse23.com/products/gurps-reign-of-steel-will-to-live",
	SU: "https://warehouse23.com/products/gurps-supers-3",
	TMS: "https://warehouse23.com/products/gurps-thaumatology-magical-styles",
	TRPM: "https://warehouse23.com/products/gurps-thaumatology-ritual-path-magic",
	TS: "https://warehouse23.com/products/gurps-tactical-shooting",
	TSOR: "https://warehouse23.com/products/gurps-thaumatology-sorcery",
	UT: "https://warehouse23.com/products/gurps-ultra-tech",
	VOR: "https://warehouse23.com/products/vorkosigan-saga-sourcebook-and-roleplaying-game",
}

function handle(event: JQuery.MouseEventBase) {
	event.preventDefault()
	const pdf = $(event.currentTarget).data("pdf")
	if (pdf) return open(pdf)
}

function open(pdfs: string) {
	for (let link of pdfs.split(",")) {
		link = link.trim()
		const colonIndex = link.indexOf(":")
		let book = ""
		let page = 0
		if (colonIndex > 0) {
			book = link.substring(0, colonIndex).trim()
			page = parseInt(link.substring(colonIndex + 1))
		} else {
			book = link.replaceAll(/\d/g, "").trim()
			page = parseInt(link.replaceAll(/\D/g, ""))
		}

		const s = game.settings.get(SYSTEM_NAME, SETTINGS.BASIC_SET_PDF)
		if (book === "B") {
			if (page > 336) {
				if (s === "separate") {
					book = "BX"
					page = page - 335
				} else page += 2
			}
		}
		if (book === "BX") {
			if (s === "combined") book = "B"
		}

		let url = (SJG_links as any)[book]
		if (!url) {
			if (pdfs.includes("http")) url = pdfs
			else url = "https://warehouse23.com/collections/gurps"
		}
		// Window.open(url, "_blank")
		const pdfPages: any[] = []
		game.journal?.forEach(j => {
			;(j as any).pages.forEach((p: any) => {
				if (p.type === "pdf") pdfPages.push(p)
			})
		})
		let journalPage
		if (pdfPages.length) journalPage = pdfPages.find((e: any) => e.type === "pdf" && e.system.code === book)
		if (journalPage) {
			console.log(journalPage, page)
			const viewer = new PDFViewerSheet(journalPage, { pageNumber: page, highlight: "Language" })
			viewer.render(true)
		} else {
			window.open(url, "_blank")
		}
	}
}

export const PDF = {
	JournalEntryPageGURPS,
	handle,
	SJG_links,
	open,
	PDFViewerSheet,
	PDFEditorSheet,
}
