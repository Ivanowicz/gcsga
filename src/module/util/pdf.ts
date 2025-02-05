import { SETTINGS, SYSTEM_NAME } from "@module/data/index.ts"
import { JournalEntryGURPS } from "@module/journal-entry/document.ts"
import { JournalEntryPagePDF } from "@module/journal-entry/page/document.ts"
import { JournalEntryPagePDFViewerSheet } from "@module/journal-entry/page/sheet.ts"

const WAREHOUSE23_LINKS: Record<string, string> = {
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
} as const

export const PAGE_REFERENCE_MAPPINGS: Record<string, string> = {
	AA: "Alphabet Arcane",
	AALS: "Alphabet Arcane: Lost Serifs",
	"ACT1:": "Action 1: Heroes",
	"ACT2:": "Action 2: Exploits",
	"ACT3:": "Action 3: Furious Fists",
	"ACT4:": "Action 4: Specialists",
	"ACT5:": "Action 5: Dictionary of Danger",
	"ACT6:": "Action 6: Tricked-Out Rides",
	"ACT7:": "Action 7: Mercenaries",
	"ACT9:": "Action 9: The City",
	AD: "Adaptations",
	"ATE1:": "After the End 1: Wastelanders",
	"ATE2:": "After the End 2: The New World",
	AS: "Aliens: Sparrials",
	B: "Basic Set: Characters OR the combined Basic Set: Characters and Campaigns",
	BC: "Boardroom and Curia",
	BCTR: "Boardroom and Curia: Tomorrow Rides",
	BCW: "Steampunk Setting: The Broken Clockwork World",
	BL: "Big Lizzie",
	BS: "Banestorm",
	BSA: "Banestorm: Abydos",
	BT: "Bio-Tech",
	BX: "Basic Set: Campaigns",
	C: "Crusades",
	CA: "Casey & Andy",
	"CN1:": "Creatures of the Night, Volume 1",
	"CN2:": "Creatures of the Night, Volume 2",
	"CN3:": "Creatures of the Night, Volume 3",
	"CN4:": "Creatures of the Night, Volume 4",
	"CN5:": "Creatures of the Night, Volume 5",
	CS: "City Stats",
	DB: "Transhuman Space: Deep Beyond (3E)",
	"DF1:": "Dungeon Fantasy 1: Adventurers",
	"DF2:": "Dungeon Fantasy 2: Dungeons",
	"DF3:": "Dungeon Fantasy 3: The Next Level",
	"DF4:": "Dungeon Fantasy 4: Sages",
	"DF5:": "Dungeon Fantasy 5: Allies",
	"DF6:": "Dungeon Fantasy 6: 40 Artifacts",
	"DF7:": "Dungeon Fantasy 7: Clerics",
	"DF8:": "Dungeon Fantasy 8: Treasure Tables",
	"DF9:": "Dungeon Fantasy 9: Summoners",
	"DF10:": "Dungeon Fantasy 10: Taverns",
	"DF11:": "Dungeon Fantasy 11: Power-Ups",
	"DF12:": "Dungeon Fantasy 12: Ninja",
	"DF13:": "Dungeon Fantasy 13: Loadouts",
	"DF14:": "Dungeon Fantasy 14: Psi",
	"DF15:": "Dungeon Fantasy 15: Henchmen",
	"DF16:": "Dungeon Fantasy 16: Wilderness Adventures",
	"DF17:": "Dungeon Fantasy 17: Guilds",
	"DF18:": "Dungeon Fantasy 18: Power Items",
	"DF19:": "Dungeon Fantasy 19: Incantation Magic",
	"DF20:": "Dungeon Fantasy 20: Slayers",
	DFA: "Dungeon Fantasy RPG: Adventurers",
	"DFA1:": "Dungeon Fantasy Adventure 1: Mirror of the Fire Demon",
	"DFA2:": "Dungeon Fantasy Adventure 2: Tomb of the Dragon King",
	"DFA3:": "Dungeon Fantasy Adventure 3: Deep Night and the Star",
	DFCG: "Dungeon Fantasy Career Guide",
	DFDB: "Dungeon Fantasy Denizens: Barbarians",
	DFDS: "Dungeon Fantasy Denizens: Swashbucklers",
	"DFE1:": "Dungeon Fantasy Encounters 1: The Pagoda of Worlds",
	"DFE2:": "Dungeon Fantasy Encounters 2: The Room",
	"DFE3:": "Dungeon Fantasy Encounters 3: The Carnival of Madness",
	DFM: "Dungeon Fantasy RPG: Monsters",
	"DFM1:": "Dungeon Fantasy Monsters 1",
	"DFM2:": "Dungeon Fantasy Monsters 2: Icky Goo",
	"DFM3:": "Dungeon Fantasy Monsters 3: Born of Myth & Magic",
	"DFM4:": "Dungeon Fantasy Monsters 4: Dragons",
	"DFM5:": "Dungeon Fantasy Monsters 5: Demons",
	"DFMI1:": "Dungeon Fantasy RPG: Magic Items 1",
	"DFMI2:": "Dungeon Fantasy RPG: Magic Items 2",
	"DFRC2:": "Dungeon Fantasy RPG: Companion 2",
	"DFRM2:": "Dungeon Fantasy RPG: Monsters 2",
	DFS: "Dungeon Fantasy RPG: Spells",
	DFSC: "Dungeon Fantasy Setting: Caverntown",
	DFSCSM: "Dungeon Fantasy Setting: Cold Shard Mountain",
	"DFT1:": "Dungeon Fantasy Treasures 1: Glittering Prizes",
	"DFT2:": "Dungeon Fantasy Treasures 2: Epic Treasures",
	"DFT3:": "Dungeon Fantasy Treasures 3: Artifacts of Felltower",
	"DFT4:": "Dungeon Fantasy Treasures 4: Mixed Blessings",
	DFX: "Dungeon Fantasy RPG: Exploits",
	DH: "Disasters: Hurricane",
	DL: "Deadlands: Weird West (3E)",
	DLH: "Deadlands: Hexes (3E)",
	DLV: "Deadlands: Varmints (3E)",
	DMF: "Disasters: Meltdown and Fallout",
	"DN1:": "Deadlands: Dime Novel 1 - Aces and Eights (3E)",
	"DN2:": "Deadlands: Dime Novel 2 - Wanted: Undead or Alive (3E)",
	DR: "Dragons",
	DTG: "Delvers To Grow",
	DW: "Discworld Roleplaying Game",
	EHHC: "Encounter: The Harrowed Hearts Club",
	F: "Fantasy",
	FED: "Federation",
	FF: "Fantasy Folk (3E)",
	FFE: "Fantasy Folk: Elves",
	FFGH: "Fantasy Folk: Goblins and Hobgoblins",
	FFK: "Fantasy Folk: Kobolds",
	FFWF: "Fantasy Folk: Winged Folk",
	FH: "Future History",
	FPR: "Fantasy: Portal Realms",
	"FT1:": "Fantasy-Tech 1: The Edge of Reality",
	"FT2:": "Fantasy-Tech 2: Weapons of Fantasy",
	FUR: "Furries",
	FW: "Transhuman Space: Fifth Wave (3E)",
	GF: "Gun Fu",
	GG: "Girl Genius RPG",
	GUL: "Gulliver Mini",
	H: "Horror",
	HF: "Historical Folks",
	HMD: "Horror: The Madness Dossier",
	HOSF: "Horror: The Old Stone Fort",
	HOW: "How to Be a GURPS GM",
	HOWRPM: "How to Be a GURPS GM: Ritual Path Magic",
	HSC: "Hot Spots: Constantinople, 527-1204 A.D.",
	HSIT: "Hot Spots: The Incense Trail",
	HSRF: "Hot Spots: Renaissance Florence",
	HSRV: "Hot Spots: Renaissance Venice",
	HSS: "Hot Spots: Sriwijaya",
	HSSR: "Hot Spots: The Silk Road",
	HT: "High-Tech",
	HTAG: "High-Tech: Adventure Guns",
	HTEE: "High-Tech: Electricity and Electronics",
	"HTPG1:": "High-Tech: Pulp Guns 1",
	"HTPG2:": "High-Tech: Pulp Guns 2",
	HTWT: "High-Tech: Weapon Tables",
	IW: "Infinite Worlds",
	IWB: "Infinite Worlds: Britannica-6",
	IWCJ: "Infinite Worlds: Collegio Januari",
	IWLW: "Infinite Worlds: Lost Worlds",
	IWWH: "Infinite Worlds: Worlds of Horror",
	KL: "Klingons",
	L: "Lite",
	LFM: "Lair of the Fat Man",
	LH: "Locations: Hellsgate",
	LMM: "Locations: Metro of Madness",
	LOLTA: "Loadouts: Low-Tech Armor",
	LOMH: "Loadouts: Monster Hunters",
	LOT: "Lands Out of Time",
	LSGC: "Locations: St. George's Cathedral",
	LT: "Low-Tech",
	"LTC1:": "Low-Tech Companion 1: Philosophers and Kings",
	"LTC2:": "Low-Tech Companion 2: Weapons and Warriors",
	"LTC3:": "Low-Tech Companion 3: Daily Life and Economics",
	LTIA: "Low-Tech: Instant Armor",
	LTO: "Locations: Tower of Octavius",
	LW: "Locations: Worminghall",
	M: "Magic",
	MA: "Martial Arts",
	MAFCCS: "Martial Arts: Fairbairn Close Combat Systems",
	MAG: "Martial Arts: Gladiators",
	MAS: "Magic: Artillery Spells",
	MATG: "Martial Arts: Technical Grappling",
	MAYFS: "Martial Arts: Yrth Fighting Styles",
	MC: "Mass Combat",
	MDS: "Magic: Death Spells",
	MGA: "MacGuffin Alphabet",
	"MH1:": "Monster Hunters 1: Champions",
	"MH2:": "Monster Hunters 2: The Mission",
	"MH3:": "Monster Hunters 3: The Enemy",
	"MH4:": "Monster Hunters 4: Sidekicks",
	"MH5:": "Monster Hunters 5: Applied Xenology",
	"MH6:": "Monster Hunters 6: Holy Hunters",
	"MHE1:": "Monster Hunters Encounters 1",
	"MHPU1:": "Monster Hunters Power-Ups 1",
	MPS: "Magic: Plant Spells",
	MSDM: "Magical Styles: Dungeon Magic",
	MSHM: "Magical Styles: Horror Magic",
	MTLOS: "Magic: The Least of Spells",
	MYST: "Mysteries",
	MYTH: "Myth (3E)",
	NBE: "Nordlondr Bestiary and Enemies Book",
	NF: "Nordlondr Folk",
	P: "Powers",
	PC: "Psionic Campaigns",
	PD: "Prime Directive",
	PDF: "Powers: Divine Favor",
	PDFC: "Pyramid: Dungeon Fantasy Collected",
	PES: "Powers: Enhanced Senses",
	PSI: "Psionic Powers",
	PSIS: "Psis",
	PT: "Psi-Tech",
	PTNS: "Powers: Totems and Nature Spirits",
	"PU1:": "Power-Ups 1: Imbuements",
	"PU2:": "Power-Ups 2: Perks",
	"PU3:": "Power-Ups 3: Talents",
	"PU4:": "Power-Ups 4: Enhancements",
	"PU5:": "Power-Ups 5: Impulse Buys",
	"PU6:": "Power-Ups 6: Quirks",
	"PU7:": "Power-Ups 7: Wildcard Skills",
	"PU8:": "Power-Ups 8: Limitations",
	"PU9:": "Power-Ups 9: Alternate Attributes",
	PW: "Powers: The Weird",
	"PY#:": 'Pyramid 3 issues (replace # with the issue number, but leave out the leading "3-")',
	"PY4-#:": "Pyramid 4 issues (replace # with the issue number)",
	PYDC: "Pyramid Dungeon Collection",
	RM: "Realm Management",
	ROM: "Romulans",
	RSRS: "Reign of Steel: Read the Sky",
	RSWL: "Reign of Steel: Will to Live",
	S: "Space",
	SCASPC: "Supporting Cast: Age of Sail Pirate Crew",
	SE: "Social Engineering",
	SEAL: "SEALs in Vietnam",
	SEBS: "Social Engineering: Back to School",
	SEKC: "Social Engineering: Keeping in Contact",
	SEPR: "Social Engineering: Pulling Rank",
	"SP1:": "Steampunk 1: Settings and Style",
	"SP2:": "Steampunk 2: Steam and Shellfire",
	"SP3:": "Steampunk 3: Soldiers and Scientists",
	SPWS: "Sorcery: Protection and Warning Spells",
	"SS1:": "Spaceships",
	"SS2:": "Spaceships 2: Traders, Liners, and Transports",
	"SS3:": "Spaceships 3: Warships and Space Pirates",
	"SS4:": "Spaceships 4: Fighters, Carriers, and Mecha",
	"SS5:": "Spaceships 5: Exploration and Colony Spacecraft",
	"SS6:": "Spaceships 6: Mining and Industrial Spacecraft",
	"SS7:": "Spaceships 7: Divergent and Paranormal Tech",
	"SS8:": "Spaceships 8: Transhuman Spacecraft",
	SSS: "Sorcery: Sound Spells",
	SU: "Supers",
	T: "Thaumatology",
	TAB: "Thaumatology: Alchemical Baroque",
	TAG: "Thaumatology: Age of Gold",
	TCEP: "Thaumatology: Chinese Elemental Powers",
	THS: "Transhuman Space",
	THSBB: "Transhuman Space: Bioroid Bazaar",
	THSBT: "Transhuman Space: Bio-Tech 2100",
	THSCE: "Transhuman Space: Cities on the Edge",
	THSCT: "Transhuman Space: Changing Times",
	THSMA: "Transhuman Space: Martial Arts 2100",
	"THSPF2:": "Transhuman Space: Personnel Files 2 - The Meme Team",
	"THSPF3:": "Transhuman Space: Personnel Files 3 - Wild Justice",
	"THSPF4:": "Transhuman Space: Personnel Files 4 - Martingale Security",
	"THSPF5:": "Transhuman Space: Personnel Files 5 - School Days 2100",
	THSST: "Transhuman Space: Shell-Tech",
	THSTM: "Transhuman Space: Transhuman Mysteries",
	"THSTN1:": "Transhuman Space: Teralogos News - 2100, Fourth Quarter",
	"THSTN2:": "Transhuman Space: Teralogos News - 2101, First Quarter",
	"THSTN3:": "Transhuman Space: Teralogos News - 2101, Second Quarter",
	"THSTN4:": "Transhuman Space: Teralogos News - 2101, Third Quarter",
	THSTX: "Transhuman Space: Toxic Memes",
	THSUP: "Transhuman Space: Under Pressure",
	THSWRS: "Transhuman Space: Wings of the Rising Sun",
	"TIW:": "Traveller: Interstellar Wars",
	TMS: "Thaumatology: Magical Styles",
	TRPM: "Thaumatology: Ritual Path Magic",
	TS: "Tactical Shooting",
	TSOR: "Thaumatology: Sorcery",
	TSP: "Tales of the Solar Patrol",
	"TT1:": "Template Toolkit 1: Characters",
	"TT2:": "Template Toolkit 2: Races",
	"TT3:": "Template Toolkit 3: Starship Crew",
	TUM: "Thaumatology: Urban Magics",
	UA: "Underground Adventures",
	UL: "Ultra-Lite",
	UT: "Ultra-Tech",
	UTWT: "Ultra-Tech: Weapon Tables",
	VOR: "Vorkosigan Saga RPG",
	VSC: "Vehicles: Steampunk Conveyances",
	VTF: "Vehicles: Transports of Fantasy",
	Z: "Zombies",
	ZDO: "Zombies: Day One",
} as const

function getReferenceBook(references: string): string[] {
	const books: string[] = []
	for (const reference of references.split(/,?\s+/)) {
		const bookpart = reference.trim().replace(/\d+$/, "").trim()
		if (Object.keys(PAGE_REFERENCE_MAPPINGS).includes(bookpart)) books.push(PAGE_REFERENCE_MAPPINGS[bookpart])
	}
	return books
}

function handle(event: MouseEvent): void {
	const element = event.currentTarget ?? null
	if (!(element instanceof HTMLElement)) return

	const link = element.dataset.pdf
	if (link) return open(link)
}

function open(pdfs: string): void {
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

		if (Object.keys(WAREHOUSE23_LINKS).includes(book)) {
			let url = WAREHOUSE23_LINKS[book]
			if (!url) {
				if (pdfs.includes("http")) url = pdfs
				else url = "https://warehouse23.com/collections/gurps"
			}
			const pdfPages: JournalEntryPagePDF<JournalEntryGURPS>[] = []
			game.journal?.forEach(j => {
				j.pages.forEach(p => {
					if (p instanceof JournalEntryPagePDF) pdfPages.push(p)
				})
			})
			let journalPage
			if (pdfPages.length) journalPage = pdfPages.find(e => e.type === "pdf" && e.system.code === book)
			if (journalPage) {
				const viewer = new JournalEntryPagePDFViewerSheet(journalPage, {
					pageNumber: page,
					// highlight: "Language",
				} as DocumentSheetOptions & { pageNumber: number })
				viewer.render(true)
			} else {
				window.open(url, "_blank")
			}
		}
	}
}

export { getReferenceBook, handle }
