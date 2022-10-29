/* eslint-disable jest/no-disabled-tests */
import { DamageCalculator, Extremity, Head, Limb } from "../../src/module/damage_calculator"
import { DiceGURPS } from "../../src/module/dice"
import { RollType } from "../../src/module/data"
import { DamageTarget, TraitAdapter, TraitModifierAdapter } from "../../src/module/damage_calculator/damage_target"
import { HitLocation, HitLocationTableWithCalc } from "../../src/module/damage_calculator/hit_location"
import { AnyPiercingType, DamageType } from "../../src/module/damage_calculator/damage_type"
import {
	DamageAttacker,
	DamageRoll,
	DamageWeapon,
	DefaultHitLocations,
} from "../../src/module/damage_calculator/damage_roll"
import { InjuryEffect, InjuryEffectType } from "../../src/module/damage_calculator/injury_effect"

// Add real tests here.
describe("Damage calculator", () => {
	let _attacker: DamageAttacker
	let _target: _Target
	let _roll: DamageRoll

	let _torso: HitLocation
	let _vitals: HitLocation
	let _skull: HitLocation
	let _eye: HitLocation
	let _face: HitLocation
	let _neck: HitLocation
	let _groin: HitLocation
	let _arm: HitLocation
	let _leg: HitLocation
	let _hand: HitLocation
	let _foot: HitLocation
	const locations = ["groin", "vitals", "neck", ...Head, ...Limb, ...Extremity]

	beforeEach(() => {
		_attacker = new _Attacker()
		_target = new _Target()
		_roll = new _DamageRoll()
		_roll.attacker = _attacker
		_roll.basicDamage = 8
		_roll.armorDivisor = 1
		_roll.vulnerability = 1
		_roll.damageType = DamageType.cr
		_roll.dice = new DiceGURPS("2d")
		_roll.locationId = "torso"

		_torso = {
			calc: {
				dr: { all: 0 },
				roll_range: "9-10",
				flexible: false,
			},
			choice_name: "Torso",
			description: "",
			dr_bonus: 0,
			table_name: "Torso",
			hit_penalty: 0,
			id: "torso",
			slots: 2,
		}

		_vitals = {
			calc: {
				dr: { all: 0 },
				roll_range: "-",
				flexible: false,
			},
			choice_name: "Vitals",
			description: "",
			dr_bonus: 0,
			table_name: "Vitals",
			hit_penalty: -3,
			id: "vitals",
			slots: 0,
		}

		_skull = {
			calc: {
				dr: { all: 0 },
				roll_range: "3-4",
				flexible: false,
			},
			choice_name: "Skull",
			description: "",
			dr_bonus: 2,
			table_name: "Skull",
			hit_penalty: -7,
			id: "skull",
			slots: 0,
		}

		_eye = {
			calc: {
				dr: { all: 0 },
				roll_range: "-",
				flexible: false,
			},
			choice_name: "Eye",
			description: "",
			dr_bonus: 0,
			table_name: "Eye",
			hit_penalty: -9,
			id: "eye",
			slots: 0,
		}

		_face = {
			calc: {
				dr: { all: 0 },
				roll_range: "5",
				flexible: false,
			},
			choice_name: "Face",
			description: "",
			dr_bonus: 0,
			table_name: "Face",
			hit_penalty: -5,
			id: "face",
			slots: 1,
		}

		_neck = {
			calc: {
				dr: { all: 0 },
				roll_range: "5",
				flexible: false,
			},
			choice_name: "Face",
			description: "",
			dr_bonus: 0,
			table_name: "Face",
			hit_penalty: -5,
			id: "face",
			slots: 1,
		}

		_groin = {
			calc: {
				dr: { all: 0 },
				roll_range: "5",
				flexible: false,
			},
			choice_name: "Face",
			description: "",
			dr_bonus: 0,
			table_name: "Face",
			hit_penalty: -5,
			id: "face",
			slots: 1,
		}

		_arm = {
			calc: {
				dr: { all: 0 },
				roll_range: "8",
				flexible: false,
			},
			choice_name: "Right Arm",
			description: "",
			dr_bonus: 0,
			table_name: "Right Arm",
			hit_penalty: -2,
			id: "arm",
			slots: 1,
		}

		_leg = {
			calc: {
				dr: { all: 0 },
				roll_range: "6-7",
				flexible: false,
			},
			choice_name: "Right Leg",
			description: "",
			dr_bonus: 0,
			table_name: "Right Leg",
			hit_penalty: -2,
			id: "leg",
			slots: 2,
		}

		_hand = {
			calc: {
				dr: { all: 0 },
				roll_range: "15",
				flexible: false,
			},
			choice_name: "Hand",
			description: "",
			dr_bonus: 0,
			table_name: "Hand",
			hit_penalty: -4,
			id: "hand",
			slots: 1,
		}

		_foot = {
			calc: {
				dr: { all: 0 },
				roll_range: "16",
				flexible: false,
			},
			choice_name: "Foot",
			description: "",
			dr_bonus: 0,
			table_name: "Foot",
			hit_penalty: -4,
			id: "foot",
			slots: 1,
		}

		_target.hitLocationTable.locations.push(_torso)
		_target.hitLocationTable.locations.push(_vitals)
		_target.hitLocationTable.locations.push(_skull)
		_target.hitLocationTable.locations.push(_eye)
		_target.hitLocationTable.locations.push(_face)
		_target.hitLocationTable.locations.push(_neck)
		_target.hitLocationTable.locations.push(_groin)
		_target.hitLocationTable.locations.push(_arm)
		_target.hitLocationTable.locations.push(_leg)
		_target.hitLocationTable.locations.push(_hand)
		_target.hitLocationTable.locations.push(_foot)
		_roll.basicDamage = 10
	})

	describe("B378: Damage Roll.", () => {
		it("The result of the damage roll is the hit’s “basic damage.”", () => {
			_roll.basicDamage = 8
			let calc = _create(_roll, _target)
			expect(calc.basicDamage).toBe(8)

			_roll.basicDamage = 4
			calc = _create(_roll, _target)
			expect(calc.basicDamage).toBe(4)
		})

		it("(Knockback Only does no damage.)", () => {
			_roll.basicDamage = 8
			_roll.damageType = DamageType.kb
			let calc = _create(_roll, _target)
			expect(calc.basicDamage).toBe(0)
		})
	})

	describe("B378: Damage Resistance and Penetration. Subtract DR from basic damage. The result is the “penetrating damage”", () => {
		it("If your foe has no DR, the entire damage roll is penetrating damage.", () => {
			_roll.basicDamage = 8
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(8)
			expect(calc.injury).toBe(calc.penetratingDamage)

			_roll.basicDamage = 15
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(15)
			expect(calc.injury).toBe(calc.penetratingDamage)
		})

		it("If your target has any Damage Resistance (DR) he subtracts this from your damage roll.", () => {
			_roll.basicDamage = 8
			_torso.calc.dr.all = 2

			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(6)
			expect(calc.injury).toBe(calc.penetratingDamage)

			_roll.basicDamage = 11
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(9)
			expect(calc.injury).toBe(calc.penetratingDamage)
		})

		it("If your damage roll is less than or equal to your target’s effective DR, your attack failed to penetrate.", () => {
			_roll.basicDamage = 5
			_torso.calc.dr.all = 9

			let calc = _create(_roll, _target)

			expect(calc.injury).toBe(0)
			expect(calc.injury).toBe(calc.penetratingDamage)

			_roll.basicDamage = 9
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(0)
			expect(calc.injury).toBe(calc.penetratingDamage)
		})

		it("(Direct Injury ignores DR.)", () => {
			_roll.damageType = DamageType.injury
			_torso.calc.dr.all = 2

			_roll.basicDamage = 8
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(8)
			expect(calc.injury).toBe(calc.penetratingDamage)

			_roll.basicDamage = 11
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(11)
			expect(calc.injury).toBe(calc.penetratingDamage)
		})
	})

	describe("B378: Armor Divisors and Penetration Modifiers.", () => {
		beforeEach(() => {
			_roll.basicDamage = 20
		})

		describe("A divisor of (2) or more means that DR protects at reduced value against the attack.", () => {
			it("Divide the target’s DR by the number in parentheses before subtracting it from basic damage; e.g., (2) means DR protects at half value.", () => {
				_torso.calc.dr.all = 20

				let divisors = [2, 5, 10]
				let expected = [10, 16, 18]
				for (let i = 0; i < divisors.length; i++) {
					_roll.armorDivisor = divisors[i]
					let calc = _create(_roll, _target)
					expect(calc.injury).toBe(expected[i])
				}
			})

			it("Round DR down. Minimum DR is 0.", () => {
				_torso.calc.dr.all = 5

				let divisors = [2, 3, 5, 10]
				let expected = [18, 19, 19, 20]
				for (let i = 0; i < divisors.length; i++) {
					_roll.armorDivisor = divisors[i]
					let calc = _create(_roll, _target)
					expect(calc.injury).toBe(expected[i])
				}
			})

			it("(Ignores DR.)", () => {
				_torso.calc.dr.all = 20
				_roll.armorDivisor = 0
				let calc = _create(_roll, _target)
				expect(calc.injury).toBe(20)
			})
		})

		describe("Some divisors are fractions, such as (0.5), (0.2), or (0.1). DR is increased against such attacks:", () => {
			it("... multiply DR by 2 for (0.5),", () => {
				_torso.calc.dr.all = 5

				_roll.armorDivisor = 0.5
				let calc = _create(_roll, _target)
				expect(calc.injury).toBe(10)
			})

			it("... by 5 for (0.2),", () => {
				_torso.calc.dr.all = 3

				_roll.armorDivisor = 0.2
				let calc = _create(_roll, _target)
				expect(calc.injury).toBe(5)
			})

			it("... and by 10 for (0.1).", () => {
				_torso.calc.dr.all = 2
				_roll.basicDamage = 21

				_roll.armorDivisor = 0.1
				let calc = _create(_roll, _target)
				expect(calc.injury).toBe(1)
			})

			it("In addition, if you have any level of this limitation, targets that have DR 0 get DR 1 against your attack.", () => {
				_torso.calc.dr.all = 0
				_roll.armorDivisor = 0.5
				let calc = _create(_roll, _target)
				expect(calc.injury).toBe(19)
			})
		})
	})

	describe("B379: Wounding Modifiers and Injury. If there is any penetrating damage, multiply it by the attack’s “wounding modifier.”", () => {
		beforeEach(() => {
			_torso.calc.dr.all = 5
			_roll.basicDamage = 11
		})

		it("Small piercing (pi-): ×0.5.", () => {
			_roll.damageType = DamageType.pi_m
			let calc = _create(_roll, _target)
			expect(calc.penetratingDamage).toBe(6)
			expect(calc.injury).toBe(3)
		})

		it("Burning (burn), corrosion (cor), crushing (cr), fatigue (fat), piercing (pi), and toxic (tox): ×1.", () => {
			let types = [DamageType.burn, DamageType.cor, DamageType.cr, DamageType.fat, DamageType.pi, DamageType.tox]
			for (const type of types) {
				_roll.damageType = type
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(6)
				expect(calc.injury).toBe(6)
			}
		})

		it("Cutting (cut) and large piercing (pi+): ×1.5.", () => {
			let types = [DamageType.cut, DamageType.pi_p]
			for (const type of types) {
				_roll.damageType = type
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(6)
				expect(calc.injury).toBe(9)
			}
		})

		it("Impaling (imp) and huge piercing (pi++): ×2.", () => {
			let types = [DamageType.imp, DamageType.pi_pp]
			for (const type of types) {
				_roll.damageType = type
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(6)
				expect(calc.injury).toBe(12)
			}
		})

		it("Round fractions down...", () => {
			_roll.damageType = DamageType.pi_m
			_roll.basicDamage = 12
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(3)
		})

		it("...but the minimum injury is 1 HP for any attack that penetrates DR at all.", () => {
			_roll.damageType = DamageType.pi_m
			_torso.calc.dr.all = 11

			_roll.basicDamage = 12
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(1)
		})
	})

	describe("B379: Flexible Armor and Blunt Trauma. An attack that does crushing, cutting, impaling, or piercing damage may inflict “blunt trauma” if it fails to penetrate flexible DR.", () => {
		beforeEach(() => {
			_torso.calc.flexible = true
			_torso.calc.dr.all = 20
		})

		it("For every full 10 points of cutting, impaling, or piercing damage stopped by your DR, you suffer 1 HP of injury due to blunt trauma.", () => {
			for (let type of [DamageType.cut, DamageType.imp, ...AnyPiercingType]) {
				_roll.damageType = type

				_roll.basicDamage = 9
				let calc = _create(_roll, _target)
				expect(calc.injury).toBe(0)
				expect(calc.bluntTrauma).toBe(0)

				_roll.basicDamage = 10
				calc = _create(_roll, _target)
				expect(calc.injury).toBe(0)
				expect(calc.bluntTrauma).toBe(1)

				_roll.basicDamage = 19
				calc = _create(_roll, _target)
				expect(calc.injury).toBe(0)
				expect(calc.bluntTrauma).toBe(1)

				_roll.basicDamage = 20
				calc = _create(_roll, _target)
				expect(calc.injury).toBe(0)
				expect(calc.bluntTrauma).toBe(2)
			}
		})

		it("For every full 5 points of crushing damage stopped by your DR, you suffer 1 HP of injury due to blunt trauma.", () => {
			_roll.damageType = DamageType.cr

			_roll.basicDamage = 4
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(0)
			expect(calc.bluntTrauma).toBe(0)

			_roll.basicDamage = 5
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(0)
			expect(calc.bluntTrauma).toBe(1)

			_roll.basicDamage = 19
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(0)
			expect(calc.bluntTrauma).toBe(3)

			_roll.basicDamage = 20
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(0)
			expect(calc.bluntTrauma).toBe(4)
		})

		it("If even one point of damage penetrates your flexible DR, however, you do not suffer blunt trauma.", () => {
			_roll.damageType = DamageType.cr
			_roll.basicDamage = 21
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(1)
			expect(calc.bluntTrauma).toBe(0)

			_roll.damageType = DamageType.pi_m
			_roll.basicDamage = 21
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(1)
			expect(calc.bluntTrauma).toBe(0)
		})

		it("(Injury, Burning, Corrosive, Fatigue, Toxic, and Knockback don't do blunt trauma.)", () => {
			for (let type of [
				DamageType.injury,
				DamageType.burn,
				DamageType.cor,
				DamageType.fat,
				DamageType.tox,
				DamageType.kb,
			]) {
				_roll.damageType = type
				_roll.basicDamage = 20
				let calc = _create(_roll, _target)
				expect(calc.bluntTrauma).toBe(0)
			}
		})
	})

	describe("B381: Shock: Any injury that causes a loss of HP also causes “shock.”", () => {
		beforeEach(() => {
			_torso.calc.dr.all = 2
		})

		let verify: any = function (hp: number, noShockValues: number[], shockValues: DamageShock[]) {
			_target.hitPoints.value = hp

			for (const damage of noShockValues) {
				_roll.basicDamage = damage
				let calc = _create(_roll, _target)
				expect(calc.injuryEffects).not.toContainEqual(expect.objectContaining({ name: "Shock" }))
			}

			for (let entry of shockValues) {
				_roll.basicDamage = entry.damage
				let calc = _create(_roll, _target)

				const injuryEffects = calc.injuryEffects
				expect(injuryEffects).toContainEqual(
					expect.objectContaining({
						id: InjuryEffectType.shock,
					})
				)

				let modifiers = calc.injuryEffects.find(it => it.id === InjuryEffectType.shock)?.modifiers
				expect(modifiers).toContainEqual(
					expect.objectContaining({
						id: "dx",
						rollType: RollType.Attribute,
						modifier: entry.shock,
					})
				)
				expect(modifiers).toContainEqual(
					expect.objectContaining({
						id: "iq",
						rollType: RollType.Attribute,
						modifier: entry.shock,
					})
				)
			}
		}

		// eslint-disable-next-line jest/expect-expect
		it("This is -1 per HP lost...", () => {
			let hp = 19
			let noShockValues = [1, 2]
			let shockValues = [
				{ damage: 3, shock: -1 },
				{ damage: 4, shock: -2 },
				{ damage: 5, shock: -3 },
				{ damage: 6, shock: -4 },
			]
			verify(hp, noShockValues, shockValues)
		})

		// eslint-disable-next-line jest/expect-expect
		it("...unless you have 20 or more HP, in which case it is -1 per (HP/10) lost, rounded down.", () => {
			for (let hp of [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]) {
				let noShockValues = [1, 2, 3]
				let shockValues = [
					{ damage: 4, shock: -1 },
					{ damage: 5, shock: -1 },
					{ damage: 6, shock: -2 },
					{ damage: 7, shock: -2 },
					{ damage: 8, shock: -3 },
					{ damage: 9, shock: -3 },
					{ damage: 10, shock: -4 },
					{ damage: 11, shock: -4 },
				]

				verify(hp, noShockValues, shockValues)
			}

			for (let hp of [30, 31, 32, 33, 34, 35, 36, 37, 38, 39]) {
				let noShockValues = [1, 2, 3, 4]
				let shockValues = [
					{ damage: 5, shock: -1 },
					{ damage: 6, shock: -1 },
					{ damage: 7, shock: -1 },
					{ damage: 8, shock: -2 },
					{ damage: 9, shock: -2 },
					{ damage: 10, shock: -2 },
					{ damage: 11, shock: -3 },
					{ damage: 12, shock: -3 },
					{ damage: 13, shock: -3 },
					{ damage: 14, shock: -4 },
					{ damage: 15, shock: -4 },
					{ damage: 16, shock: -4 },
				]

				verify(hp, noShockValues, shockValues)
			}
		})

		// eslint-disable-next-line jest/expect-expect
		it("The shock penalty cannot exceed -4, no matter how much injury you suffer.", () => {
			let hp = 12
			let noShockValues: never[] = [] // We're not testing this here.
			let shockValues = [
				{ damage: 7, shock: -4 },
				{ damage: 17, shock: -4 },
				{ damage: 57, shock: -4 },
			]

			verify(hp, noShockValues, shockValues)
		})
	})

	describe("B381: Major Wounds.", () => {
		it("Any single injury that inflicts a wound in excess of 1/2 your HP is a major wound.", () => {
			_target.hitPoints.value = 12
			_roll.locationId = "any location"

			_roll.basicDamage = 6
			let calc = _create(_roll, _target)
			expect(calc.injuryEffects).not.toContainEqual(expect.objectContaining({ id: "majorWound" }))

			_roll.basicDamage = 7
			calc = _create(_roll, _target)
			expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: "majorWound" }))
			let wound = calc.injuryEffects.find(it => it.id === "majorWound")
			expect(wound?.modifiers.length).toBe(0)
		})

		it("For a major wound to the torso, you must make a HT roll. Failure means you’re stunned and knocked down; failure by 5+ means you pass out.", () => {
			_target.hitPoints.value = 12
			_roll.locationId = "torso"
			_roll.basicDamage = 7

			const calc = _create(_roll, _target)

			let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
					failures: Knockdown,
				})
			)
		})
	})

	describe("B378: Knockback. Knockback depends on basic damage rolled before subtracting DR.", () => {
		beforeEach(() => {
			_target.ST = 12
		})

		it("Only crushing and cutting (and knockback only) attacks can cause knockback.", () => {
			_torso.calc.dr.all = 16
			_target.ST = 10
			_roll.basicDamage = 16

			const testKeys = Object.keys(DamageType).filter(k => !["cr", "cut", "kb"].includes(k))
			for (let type of testKeys as (keyof typeof DamageType)[]) {
				_roll.damageType = DamageType[type]

				let calc = _create(_roll, _target)
				expect(calc.knockback).toBe(0)
			}
		})

		it("A crushing (or knockback only) attack can cause knockback regardless of whether it penetrates DR.", () => {
			expect(_roll.damageType).toBe(DamageType.cr)

			_roll.basicDamage = 9
			let calc = _create(_roll, _target)
			expect(calc.knockback).toBe(0)

			_roll.basicDamage = 10
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			_roll.basicDamage = 19
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			_roll.basicDamage = 20
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(2)

			_roll.damageType = DamageType.kb

			_roll.basicDamage = 9
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(0)

			_roll.basicDamage = 10
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			_roll.basicDamage = 19
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			_roll.basicDamage = 20
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(2)
		})

		it("A cutting attack can cause knockback only if it fails to penetrate DR.", () => {
			_roll.damageType = DamageType.cut
			_torso.calc.dr.all = 15

			_roll.basicDamage = 9
			let calc = _create(_roll, _target)
			expect(calc.knockback).toBe(0)

			_roll.basicDamage = 15
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			_roll.basicDamage = 16
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(0)
		})

		it("For every full multiple of the target’s ST-2 rolled, move the target one yard away from the attacker.", () => {
			_roll.damageType = DamageType.cr

			_roll.basicDamage = 9
			let calc = _create(_roll, _target)
			expect(calc.knockback).toBe(0)

			_roll.basicDamage = 10
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			_roll.basicDamage = 19
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			_roll.basicDamage = 20
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(2)
		})

		it("Anyone who suffers knockback must attempt a roll against the highest of DX, Acrobatics, or Judo. On a failure, he falls down.", () => {
			expect(_roll.damageType).toBe(DamageType.cr)

			_roll.basicDamage = 10
			let calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			const injuryEffects = calc.injuryEffects
			expect(injuryEffects).toContainEqual(
				expect.objectContaining({
					id: "knockback",
				})
			)

			let checks = calc.injuryEffects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: 0 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: 0 },
						{ id: "Judo", rollType: RollType.Skill, modifier: 0 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				})
			)
		})

		it("... at -1 per yard after the first.", () => {
			expect(_roll.damageType).toBe(DamageType.cr)

			_roll.basicDamage = 20
			let calc = _create(_roll, _target)
			expect(calc.knockback).toBe(2)

			const injuryEffects = calc.injuryEffects
			expect(injuryEffects).toContainEqual(
				expect.objectContaining({
					id: "knockback",
				})
			)

			let checks = calc.injuryEffects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: -1 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: -1 },
						{ id: "Judo", rollType: RollType.Skill, modifier: -1 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				})
			)

			_roll.basicDamage = 50
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(5)

			checks = calc.injuryEffects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: -4 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: -4 },
						{ id: "Judo", rollType: RollType.Skill, modifier: -4 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				})
			)
		})

		it("Perfect Balance gives +4 to this roll.", () => {
			expect(_roll.damageType).toBe(DamageType.cr)

			_target._traits.push(new TraitAdapter("Perfect Balance", 0))

			_roll.basicDamage = 10
			let calc = _create(_roll, _target)
			expect(calc.knockback).toBe(1)

			const injuryEffects = calc.injuryEffects
			expect(injuryEffects).toContainEqual(
				expect.objectContaining({
					id: "knockback",
				})
			)

			let checks = calc.injuryEffects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: 4 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: 4 },
						{ id: "Judo", rollType: RollType.Skill, modifier: 4 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				})
			)

			_roll.basicDamage = 30
			calc = _create(_roll, _target)
			expect(calc.knockback).toBe(3)

			checks = calc.injuryEffects.find(it => it.id === "knockback")?.checks
			expect(checks).toContainEqual(
				expect.objectContaining({
					checks: [
						{ id: "dx", rollType: RollType.Attribute, modifier: 2 },
						{ id: "Acrobatics", rollType: RollType.Skill, modifier: 2 },
						{ id: "Judo", rollType: RollType.Skill, modifier: 2 },
					],
					failures: [{ id: "fall prone", margin: 0 }],
				})
			)
		})
	})

	describe("B398: Hit Location", () => {
		describe("Vitals.", () => {
			beforeEach(() => {
				_roll.locationId = "vitals"
			})

			it("Increase the wounding modifier for an impaling or any piercing attack to ×3.", () => {
				let types = [DamageType.imp, ...AnyPiercingType]
				for (const type of types) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(30)
				}
			})

			it("Increase the wounding modifier for a tight-beam burning attack to ×2.", () => {
				_roll.damageType = DamageType.burn
				_roll.damageModifier = "tbb"
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(10)
				expect(calc.injury).toBe(20)
			})

			it("B420: Whenever you are struck in the vitals for enough injury to cause a shock penalty, you must make an immediate HT roll to avoid knockdown.", () => {
				_roll.basicDamage = 1
				_roll.damageType = DamageType.cr
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(1)
				expect(calc.injury).toBe(1)

				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.shock }))

				let checks = calc.injuryEffects.find(it => it.id === InjuryEffectType.majorWound)?.checks
				expect(checks).toContainEqual(
					expect.objectContaining({
						checks: [{ id: "ht", modifier: -5, rollType: RollType.Attribute }],
						failures: Knockdown,
					})
				)
			})
		})

		describe("Skull or Eye. (For eye, treat as a skull hit without the extra DR 2!)", () => {
			it("The wounding modifier for all attacks increases to ×4.", () => {
				for (const location of ["skull", "eye"]) {
					_roll.locationId = location

					let types = [
						DamageType.imp,
						...AnyPiercingType,
						DamageType.burn,
						DamageType.cor,
						DamageType.cr,
						DamageType.cut,
					]
					for (const type of types) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(10)
						expect(calc.injury).toBe(40)
					}
				}
			})

			it("Knockdown (stun) rolls are at -10.", () => {
				for (const location of ["skull", "eye"]) {
					_roll.locationId = location

					let types = [
						DamageType.imp,
						...AnyPiercingType,
						DamageType.burn,
						DamageType.cor,
						DamageType.cr,
						DamageType.cut,
					]
					for (const type of types) {
						_roll.damageType = type
						let calc = _create(_roll, _target)

						let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
						expect(checks).toContainEqual(
							expect.objectContaining({
								checks: [{ id: "ht", modifier: -10, rollType: RollType.Attribute }],
								failures: Knockdown,
							})
						)
					}
				}
			})

			it("B420: Whenever you are struck in the head for enough injury to cause a shock penalty, you must make an immediate HT roll to avoid knockdown.", () => {
				for (const location of ["skull", "eye"]) {
					_roll.locationId = location

					_roll.basicDamage = 1
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(1)
					expect(calc.injury).toBe(4)

					expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: "shock" }))

					let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: -10, rollType: RollType.Attribute }],
							failures: Knockdown,
						})
					)
				}
			})

			it("None of these effects apply to toxic damage.", () => {
				for (const location of ["skull", "eye"]) {
					_roll.locationId = location

					_roll.basicDamage = 8
					_roll.damageType = DamageType.tox
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(8)
					expect(calc.injury).toBe(8)

					expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: "majorWound" }))
				}
			})

			it("Fatigue damage always ignores hit location.", () => {
				for (const location of ["skull", "eye"]) {
					_roll.locationId = location

					_roll.damageType = DamageType.fat
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(10)
				}
			})

			it("Injury over HP/10 blinds the eye.", () => {
				_target.hitPoints.value = 50
				_roll.locationId = "eye"

				_roll.basicDamage = 1
				_roll.damageType = DamageType.cr
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(1)
				expect(calc.injury).toBe(4)

				expect(calc.injuryEffects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.basicDamage = 2
				_roll.damageType = DamageType.cr
				calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(2)
				expect(calc.injury).toBe(8)

				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.eyeBlinded }))
			})
		})

		describe("Face.", () => {
			beforeEach(() => {
				_roll.locationId = "face"
			})

			it("Corrosion damage (only) gets a ×1.5 wounding modifier.", () => {
				_roll.damageType = DamageType.cor
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(10)
				expect(calc.injury).toBe(15)

				let types = [DamageType.imp, ...AnyPiercingType, DamageType.burn, DamageType.cr, DamageType.cut]
				for (const type of types) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(10)
				}
			})

			it("Knockdown (stun) rolls are at -5.", () => {
				let calc = _create(_roll, _target)

				let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
				expect(checks).toContainEqual(
					expect.objectContaining({
						checks: [{ id: "ht", modifier: -5, rollType: RollType.Attribute }],
						failures: Knockdown,
					})
				)
			})

			it("If (Corrosive damage) inflicts a major wound, it also blinds one eye...", () => {
				_roll.locationId = "face"
				_roll.basicDamage = 8
				_roll.damageType = DamageType.cor
				let calc = _create(_roll, _target)

				expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 2)
				expect(calc.injury).toBeLessThan(_target.hitPoints.value)
				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.majorWound }))
				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.eyeBlinded }))
			})

			it("...(both eyes on damage greater than full HP).", () => {
				_roll.locationId = "face"
				_roll.basicDamage = 15
				_roll.damageType = DamageType.cor
				let calc = _create(_roll, _target)

				expect(calc.injury).toBeGreaterThan(_target.hitPoints.value)
				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.majorWound }))
				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.blinded }))
			})
		})

		describe("Neck.", () => {
			beforeEach(() => {
				_roll.locationId = "neck"
			})

			it("Increase the wounding multiplier of crushing and corrosion attacks to ×1.5", () => {
				let types = [DamageType.cr, DamageType.cor]
				for (const type of types) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(15)
				}
			})

			it("...and that of cutting damage to ×2.", () => {
				_roll.damageType = DamageType.cut
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(10)
				expect(calc.injury).toBe(20)
			})

			it("(Other damage types are unchanged.)", () => {
				_roll.damageType = DamageType.pi_m
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(10)
				expect(calc.injury).toBe(5)

				for (const type of [DamageType.burn, DamageType.fat, DamageType.pi, DamageType.tox]) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(10)
				}

				_roll.damageType = DamageType.pi_p
				calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(10)
				expect(calc.injury).toBe(15)

				for (const type of [DamageType.imp, DamageType.pi_pp]) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(20)
				}
			})
		})

		describe("Groin.", () => {
			beforeEach(() => {
				_roll.locationId = "groin"
			})

			it("Treat as a torso hit...", () => {
				_roll.damageType = DamageType.pi_m
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(10)
				expect(calc.injury).toBe(5)

				for (const type of [
					DamageType.burn,
					DamageType.fat,
					DamageType.pi,
					DamageType.tox,
					DamageType.cr,
					DamageType.cor,
				]) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(10)
				}

				for (const type of [DamageType.cut, DamageType.pi_p]) {
					_roll.damageType = type
					calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(15)
				}

				for (const type of [DamageType.imp, DamageType.pi_pp]) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(20)
				}
			})

			it("except that human males suffer double the usual shock from crushing damage (to a maximum of -8).", () => {
				_roll.damageType = DamageType.cr

				for (const damage of [1, 2, 3, 4]) {
					_roll.basicDamage = damage
					let calc = _create(_roll, _target)
					const injuryEffects = calc.injuryEffects

					let modifiers = calc.injuryEffects.find(it => it.id === InjuryEffectType.shock)?.modifiers
					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "dx",
							rollType: RollType.Attribute,
							modifier: damage * -2,
						})
					)
					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "iq",
							rollType: RollType.Attribute,
							modifier: damage * -2,
						})
					)
				}
			})

			it("...and get -5 to knockdown rolls.", () => {
				_roll.damageType = DamageType.cr
				let calc = _create(_roll, _target)

				let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
				expect(checks).toContainEqual(
					expect.objectContaining({
						checks: [{ id: "ht", modifier: -5, rollType: RollType.Attribute }],
						failures: Knockdown,
					})
				)
			})
		})

		describe("Arm or Leg.", () => {
			beforeEach(() => {
				_roll.basicDamage = 6
			})

			it("Reduce the wounding multiplier of large piercing, huge piercing, and impaling damage to ×1.", () => {
				for (const id of Limb) {
					_roll.locationId = id
					_roll.damageType = DamageType.pi_m
					let calc = _create(_roll, _target)
					for (const type of [DamageType.imp, DamageType.pi_pp, DamageType.pi_p]) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(6)
						expect(calc.injury).toBe(6)
					}
				}
			})

			it("(Other damage types are unchanged.)", () => {
				for (const id of Limb) {
					_roll.locationId = id
					_roll.basicDamage = 6

					_roll.damageType = DamageType.pi_m
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(6)
					expect(calc.injury).toBe(3)

					for (const type of [
						DamageType.burn,
						DamageType.fat,
						DamageType.pi,
						DamageType.tox,
						DamageType.cr,
						DamageType.cor,
					]) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(6)
						expect(calc.injury).toBe(6)
					}

					for (const type of [DamageType.cut]) {
						_roll.basicDamage = 4
						_roll.damageType = type
						calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(4)
						expect(calc.injury).toBe(6)
					}
				}
			})

			it("Any major wound (loss of over 1/2 HP from one blow) cripples the limb...", () => {
				for (const id of Limb) {
					_roll.locationId = id

					_roll.basicDamage = 10
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 2)

					let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						})
					)

					expect(calc.injuryEffects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled })
					)
				}
			})

			it("...but damage beyond the minimum required to inflict a crippling injury is lost.", () => {
				for (const id of Limb) {
					_roll.locationId = id

					_target.hitPoints.value = 15
					_roll.basicDamage = 10
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					// Math.floor(_target.hitPoints.value / 2) + 1
					expect(calc.injury).toBe(8)
				}
			})
		})

		describe("Hand or Foot.", () => {
			beforeEach(() => {
				_roll.basicDamage = 6
				_target.hitPoints.value = 21
			})

			it("Reduce the wounding multiplier of large piercing, huge piercing, and impaling damage to ×1.", () => {
				for (const id of Extremity) {
					_roll.locationId = id
					_roll.damageType = DamageType.pi_m
					let calc = _create(_roll, _target)
					for (const type of [DamageType.imp, DamageType.pi_pp, DamageType.pi_p]) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(6)
						expect(calc.injury).toBe(6)
					}
				}
			})

			it("(Other damage types are unchanged.)", () => {
				for (const id of Extremity) {
					_roll.locationId = id
					_roll.basicDamage = 6

					_roll.damageType = DamageType.pi_m
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(6)
					expect(calc.injury).toBe(3)

					for (const type of [
						DamageType.burn,
						DamageType.fat,
						DamageType.pi,
						DamageType.tox,
						DamageType.cr,
						DamageType.cor,
					]) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(6)
						expect(calc.injury).toBe(6)
					}

					for (const type of [DamageType.cut]) {
						_roll.basicDamage = 4
						_roll.damageType = type
						calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(4)
						expect(calc.injury).toBe(6)
					}
				}
			})

			it("damage over 1/3 HP in one blow inflicts a crippling major wound...", () => {
				for (const id of Extremity) {
					_roll.locationId = id

					_roll.basicDamage = 8
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 3)

					let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						})
					)

					expect(calc.injuryEffects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled })
					)
				}
			})

			it("...but damage beyond the minimum required to inflict a crippling injury is lost.", () => {
				for (const id of Extremity) {
					_roll.locationId = id

					_target.hitPoints.value = 15
					_roll.basicDamage = 10
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					// Math.floor(_target.hitPoints.value / 3) + 1
					expect(calc.injury).toBe(6)
				}
			})
		})
	})

	describe("B380: Injury to Unliving, Homogenous, and Diffuse Targets.", () => {
		describe("Unliving.", () => {
			beforeEach(() => {
				_torso.calc.dr.all = 5
				_target.isUnliving = true
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1; ...", () => {
				let types = [DamageType.imp, DamageType.pi_pp]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(6)
					expect(calc.injury).toBe(6)
				}
			})

			it("... large piercing, ×1/2;", () => {
				let types = [DamageType.pi_p]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(6)
					expect(calc.injury).toBe(6)
				}
			})

			it("... piercing, ×1/3;", () => {
				let types = [DamageType.pi]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(6)
					expect(calc.injury).toBe(2)
				}
			})

			it("... and small piercing, ×1/5.", () => {
				let types = [DamageType.pi_m]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 15
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(2)
				}
			})
		})

		describe("Homogenous.", () => {
			beforeEach(() => {
				_torso.calc.dr.all = 5
				_target.isHomogenous = true
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1/2; ...", () => {
				let types = [DamageType.imp, DamageType.pi_pp]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(6)
					expect(calc.injury).toBe(3)
				}
			})

			it("... large piercing, ×1/3;", () => {
				let types = [DamageType.pi_p]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(6)
					expect(calc.injury).toBe(2)
				}
			})

			it("... piercing, ×1/5;", () => {
				let types = [DamageType.pi]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 15
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(2)
				}
			})

			it("... and small piercing, ×1/10.", () => {
				let types = [DamageType.pi_m]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 15
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(1)
				}
			})
		})

		describe("Diffuse.", () => {
			beforeEach(() => {
				_torso.calc.dr.all = 5
				_target.isDiffuse = true
				_roll.basicDamage = 100
			})

			it("Impaling and piercing attacks (of any size) never do more than 1 HP of injury.", () => {
				let types = [DamageType.imp, DamageType.pi_pp, DamageType.pi_p, DamageType.pi, DamageType.pi_m]
				for (const type of types) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(95)
					expect(calc.injury).toBe(1)
				}
			})

			it("Other attacks can never do more than 2 HP of injury.", () => {
				let types = [
					DamageType.burn,
					DamageType.cor,
					DamageType.cr,
					DamageType.cut,
					DamageType.fat,
					DamageType.injury,
					DamageType.tox,
				]
				for (const type of types) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.injury).toBe(2)
				}
			})
		})
	})

	describe("B400: Injury Tolerance and Hit Location.", () => {
		describe("Unliving.", () => {
			beforeEach(() => {
				_torso.calc.dr.all = 5
				_target.isUnliving = true
			})

			it("Piercing and impaling damage to any location other than eye, skull, or vitals uses wounding modifiers from Injury to Unliving, Homogenous, and Diffuse Targets.", () => {
				_roll.locationId = "skull"
				let types = [DamageType.imp, ...AnyPiercingType]
				for (const type of types) {
					_roll.damageType = type
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(40)
				}
			})
		})

		describe("Homogenous.", () => {
			beforeEach(() => {
				_torso.calc.dr.all = 5
				_target.isHomogenous = true
			})

			it("Ignore all wounding modifiers for hit location.", () => {
				for (const location of locations) {
					_roll.locationId = location

					for (const type of [DamageType.imp, DamageType.pi_pp]) {
						_roll.damageType = type
						_roll.basicDamage = 11
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(11)
						expect(calc.injury).toBe(5)
					}

					_roll.damageType = DamageType.pi_p
					_roll.basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(11)
					expect(calc.injury).toBe(3)

					_roll.damageType = DamageType.pi
					_roll.basicDamage = 15
					calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(15)
					expect(calc.injury).toBe(3)

					_roll.damageType = DamageType.pi_m
					_roll.basicDamage = 20
					calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(20)
					expect(calc.injury).toBe(2)
				}
			})

			it("Ignore all knockdown modifiers for hit location.", () => {
				for (const location of locations) {
					_roll.locationId = location
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)

					let checks = calc.injuryEffects.find(it => it.id === InjuryEffectType.majorWound)?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						})
					)
				}
			})

			it("(Eyes can still be crippled.)", () => {
				_target.hitPoints.value = 50
				_roll.locationId = "eye"

				_roll.basicDamage = 5
				_roll.damageType = DamageType.cr
				let calc = _create(_roll, _target)
				expect(calc.injury).toBeLessThanOrEqual(_target.hitPoints.value / 10)
				expect(calc.injuryEffects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.basicDamage = 6
				_roll.damageType = DamageType.cr
				calc = _create(_roll, _target)
				expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 10)
				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.eyeBlinded }))
			})

			it("(Limbs can still be crippled.)", () => {
				for (const id of Limb) {
					_roll.locationId = id

					_roll.basicDamage = 10
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 2)
					expect(calc.injuryEffects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled })
					)
				}
			})

			it("(Assume that hands and feet can still be crippled.)", () => {
				for (const id of Extremity) {
					_roll.locationId = id

					_roll.basicDamage = 10
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 3)
					expect(calc.injuryEffects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled })
					)
				}
			})
		})

		describe("Diffuse.", () => {
			beforeEach(() => {
				_torso.calc.dr.all = 5
				_target.isDiffuse = true
				_roll.basicDamage = 100
			})

			it("Ignore all wounding modifiers for hit location.", () => {
				for (const location of locations) {
					_roll.locationId = location

					for (const type of [DamageType.imp, ...AnyPiercingType]) {
						_roll.damageType = type
						_roll.basicDamage = 11
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(11)
						expect(calc.injury).toBe(1)
					}

					let types = [
						DamageType.burn,
						DamageType.cor,
						DamageType.cr,
						DamageType.cut,
						DamageType.fat,
						DamageType.injury,
						DamageType.tox,
					]
					for (const type of types) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.injury).toBe(2)
					}
				}
			})

			it("Ignore all knockdown modifiers for hit location.", () => {
				_target.hitPoints.value = 3
				for (const location of locations) {
					_roll.locationId = location
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)

					let checks = calc.injuryEffects.find(it => it.id === InjuryEffectType.majorWound)?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						})
					)
				}
			})

			it("(Eyes can still be crippled.)", () => {
				_target.hitPoints.value = 10
				_roll.locationId = "eye"

				_roll.basicDamage = 5
				_roll.damageType = DamageType.imp
				let calc = _create(_roll, _target)
				expect(calc.injury).toBeLessThanOrEqual(_target.hitPoints.value / 10)
				expect(calc.injuryEffects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.basicDamage = 6
				_roll.damageType = DamageType.cr
				calc = _create(_roll, _target)
				expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 10)
				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.eyeBlinded }))
			})

			it("(Limbs can still be crippled.)", () => {
				for (const id of Limb) {
					_roll.locationId = id
					_target.hitPoints.value = 2
					_roll.basicDamage = 10
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 2)
					expect(calc.injuryEffects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled })
					)
				}
			})

			it("(Assume that hands and feet can still be crippled.)", () => {
				for (const id of Extremity) {
					_roll.locationId = id
					_target.hitPoints.value = 2
					_roll.basicDamage = 10
					_roll.damageType = DamageType.cr
					let calc = _create(_roll, _target)
					expect(calc.injury).toBeGreaterThan(_target.hitPoints.value / 3)
					expect(calc.injuryEffects).toContainEqual(
						expect.objectContaining({ id: InjuryEffectType.limbCrippled })
					)
				}
			})
		})

		describe("No Brain.", () => {
			const theLocations = ["skull", "eye"]
			beforeEach(() => {
				_target._traits.push(new TraitAdapter("No Brain", 0))
			})

			it("Hits to the skull (or eye) get no extra knockdown modifier.", () => {
				for (const location of theLocations) {
					_roll.locationId = location

					let types = [
						DamageType.imp,
						...AnyPiercingType,
						DamageType.burn,
						DamageType.cor,
						DamageType.cr,
						DamageType.cut,
					]
					for (const type of types) {
						_roll.damageType = type
						let calc = _create(_roll, _target)

						let checks = calc.injuryEffects.find(it => it.id === "majorWound")?.checks
						expect(checks).toContainEqual(
							expect.objectContaining({
								checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
								failures: Knockdown,
							})
						)
					}
				}
			})

			it("Hits to the skull (or eye) get no extra wounding modifier.", () => {
				for (const location of theLocations) {
					_roll.locationId = location

					for (const type of [
						DamageType.burn,
						DamageType.cor,
						DamageType.cr,
						DamageType.pi,
						DamageType.tox,
					]) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(10)
						expect(calc.injury).toBe(10)
					}

					for (const type of [DamageType.cut, DamageType.pi_p]) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(10)
						expect(calc.injury).toBe(15)
					}

					for (const type of [DamageType.imp, DamageType.pi_pp]) {
						_roll.damageType = type
						let calc = _create(_roll, _target)
						expect(calc.penetratingDamage).toBe(10)
						expect(calc.injury).toBe(20)
					}

					_roll.damageType = DamageType.pi_m
					let calc = _create(_roll, _target)
					expect(calc.penetratingDamage).toBe(10)
					expect(calc.injury).toBe(5)
				}
			})

			it("Hits to the eye can cripple the eye.", () => {
				_target.hitPoints.value = 20
				_roll.locationId = "eye"

				_roll.basicDamage = 1
				_roll.damageType = DamageType.cr
				let calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(1)
				expect(calc.injury).toBe(1)

				expect(calc.injuryEffects).not.toContainEqual(expect.objectContaining({ id: "eye blinded" }))

				_roll.basicDamage = 3
				_roll.damageType = DamageType.cr
				calc = _create(_roll, _target)
				expect(calc.penetratingDamage).toBe(3)
				expect(calc.injury).toBe(3)

				expect(calc.injuryEffects).toContainEqual(expect.objectContaining({ id: InjuryEffectType.eyeBlinded }))
			})
		})

		describe("No Vitals.", () => {
			const theLocations = ["vitals", "groin"]
			beforeEach(() => {
				_target._traits.push(new TraitAdapter("No Vitals", 0))
			})

			it("Hits to the vitals or groin have the same effect as torso hits.", () => {
				for (const location of theLocations) {
					_roll.locationId = location
					_target.hitPoints.value = 12
					_roll.basicDamage = 7

					const calc = _create(_roll, _target)
					const injuryEffects = calc.injuryEffects

					expect(calc.injury).toBe(7)

					let checks = injuryEffects.find(it => it.id === "majorWound")?.checks
					expect(checks).toContainEqual(
						expect.objectContaining({
							checks: [{ id: "ht", modifier: 0, rollType: RollType.Attribute }],
							failures: Knockdown,
						})
					)

					let modifiers = injuryEffects.find(it => it.id === InjuryEffectType.shock)?.modifiers
					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "dx",
							rollType: RollType.Attribute,
							modifier: -4,
						})
					)

					expect(modifiers).toContainEqual(
						expect.objectContaining({
							id: "iq",
							rollType: RollType.Attribute,
							modifier: -4,
						})
					)
				}
			})
		})

		describe("P53: Injury Tolerance (Damage Reduction).", () => {
			it("You divide the injury you suffer by 2, 3, or 4 after subtracting DR from damage and applying wounding modifiers.", () => {
				_torso.calc.dr.all = 4
				_roll.damageType = DamageType.imp
				_roll.basicDamage = 16

				let calc = _create(_roll, _target)
				expect(calc.injury).toBe(24)

				const damageReduction = new TraitAdapter("Damage Reduction", 2)
				_target._traits.push(damageReduction)
				calc = _create(_roll, _target)
				expect(calc.injury).toBe(12)

				damageReduction.levels = 3
				calc = _create(_roll, _target)
				expect(calc.injury).toBe(8)

				damageReduction.levels = 4
				calc = _create(_roll, _target)
				expect(calc.injury).toBe(6)
			})
		})
	})

	describe("B400: Large-Area Injury.", () => {
		it("Your “effective DR” is the average of your torso DR and the DR of the least protected hit location exposed to the attack, rounding up.", () => {
			_torso.calc.dr.all = 12
			_vitals.calc.dr.all = 6
			_skull.calc.dr.all = 6
			_eye.calc.dr.all = 2
			_face.calc.dr.all = 6
			_neck.calc.dr.all = 6
			_groin.calc.dr.all = 6
			_arm.calc.dr.all = 6
			_leg.calc.dr.all = 6
			_hand.calc.dr.all = 6
			_foot.calc.dr.all = 6

			_roll.locationId = DefaultHitLocations.LargeArea
			_roll.basicDamage = 10
			const calc = _create(_roll, _target)
			expect(calc.injury).toBe(3)
		})
	})

	describe("B378: Half Damage (1/2D) for Ranged Weapons.", () => {
		it("If the target is at or beyond 1/2D range, divide basic damage by 2, rounding down.", () => {
			_torso.calc.dr.all = 5
			_roll.damageType = DamageType.imp
			_roll.basicDamage = 16

			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(22)

			_roll.isHalfDamage = true
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(6)
		})
	})

	describe("B161: Vulnerability.", () => {
		it("Applies a special wounding multiplier to damage that penetrates your DR. Regular wounding multipliers further multiply the damage.", () => {
			_torso.calc.dr.all = 5
			_roll.basicDamage = 10
			_roll.damageType = DamageType.cr

			_roll.vulnerability = 3
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(15)

			_roll.vulnerability = 2
			expect(calc.injury).toBe(10)
		})
	})

	describe("B47: Damage Resistance (Hardened).", () => {
		it("Each level of Hardened reduces the armor divisor of an attack by one step.", () => {
			// These steps are, in order: “ignores DR,” 100, 10, 5, 3, 2, and 1 (no divisor).
			_torso.calc.dr.all = 20
			_roll.basicDamage = 20
			_roll.armorDivisor = 10
			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(18)

			const trait = new TraitAdapter("Damage Resistance", 0)
			trait.modifiers.push(new TraitModifierAdapter("Hardened", 2))
			_target._traits.push(trait)
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(14)

			_roll.armorDivisor = 2
			calc = _create(_roll, _target)
			expect(calc.injury).toBe(0)
		})
	})

	describe("B409: Shotguns and Multiple Projectiles.", () => {
		it("At ranges <10% of 1/2D, don’t apply the RoF multiplier to RoF. Instead, multiply both basic damage dice and the target’s DR by half that value (round down).", () => {
			// Example: shotgun with 3x9 RoF and 1d+1 damage. Half of x9 is 4 (round down).
			// The new basic damage is 1d+1 x 4 (4d+4); the target's DR is also multiplied by 4.

			_torso.calc.dr.all = 6

			// TODO: It may be possible to derive this info if we had a reference to the weapon used (to find the RoF
			// multiple and 10% of 1/2D range) and the distance between target and attacker.
			//
			// TODO: Maybe the correct approach is to determine damage BEFORE passing to the calculator, and setting
			// the "isShotgunExtremeRange" flag in the DamageRoll object?
			_roll.isShotgunCloseRange = true
			_roll.rofMultiplier = 9

			let calc = _create(_roll, _target)
			expect(calc.injury).toBe(16)
		})
	})

	describe("B414: Explosions.", () => {
		beforeEach(() => {
			_roll.dice = new DiceGURPS("3d")
			_roll.damageModifier = "ex"
		})

		it("An explosion inflicts “collateral damage” on everything within (2 × dice of damage) yards.", () => {
			_roll.dice = new DiceGURPS("1d+3")
			_roll.range = 3
			_roll.basicDamage = 9

			const calc = _create(_roll, _target)
			// It would be 9 ÷ (3 × 3) = 1; except the range is too far.
			expect(calc.basicDamage).toBe(0)

			_roll.range = 2
			// It should be 9 ÷ (3 × 2) = 1.
			expect(calc.basicDamage).toBe(1)
		})

		it("Roll this damage but divide it by (3 × yards from the center of the blast), rounding down.", () => {
			_roll.range = 2
			_roll.basicDamage = 13

			const calc = _create(_roll, _target)
			expect(calc.basicDamage).toBe(2) // 13 ÷ (3 × 2) = 2

			_roll.range = 1
			expect(calc.basicDamage).toBe(4) // 13 ÷ (3 × 1) = 4

			_roll.range = 3
			expect(calc.basicDamage).toBe(1) // 13 ÷ (3 × 3) = 1
		})

		describe.skip("Contact Explosions. A person can throw himself on a grenade, etc.", () => {
			it("They take maximum possible damage; their DR protects them normally.", () => {
				expect(false).toBeTruthy()
			})

			it("Everyone else gets his torso’s DR + HP as “cover DR.”", () => {
				expect(false).toBeTruthy()
			})
		})

		it.skip("Internal Explosions: DR has no effect! In addition, treat the blast as an attack on the vitals, with a ×3 wounding modifier.", () => {
			expect(false).toBeTruthy()
		})
	})

	describe.skip("B552: Non-Humanoid Hit Location Tables", () => {
		it("Wing: Treat a wing as a limb (arm, leg) for crippling purposes. A flyer with a crippled wing cannot fly.", () => {
			expect(false).toBeTruthy()
		})
		it("Fin: Treat a fin as an extremity (hand, foot) for crippling purposes. A crippled fin affects balance: -3 DX.", () => {
			expect(false).toBeTruthy()
		})
		it("Tail: If an Extra Arm or a Striker, or is a fish tail, treat it as a limb for crippling purposes; otherwise, treat it as an extremity. A crippled tail affects balance. For a ground creature, this gives -1 DX. For a swimmer or flyer, this gives -2 DX and halves Move.", () => {
			expect(false).toBeTruthy()
		})
	})

	describe.skip("B554: Vehicle Hit Location Table", () => {
		it("Body", () => {
			expect(false).toBeTruthy()
		})

		it("Caterpillar Track", () => {
			expect(false).toBeTruthy()
		})

		it("Exposed Weapon Mount", () => {
			expect(false).toBeTruthy()
		})

		it("Helicopter Rotor", () => {
			expect(false).toBeTruthy()
		})

		it("Large Glass Window", () => {
			expect(false).toBeTruthy()
		})

		it("Small Glass Window", () => {
			expect(false).toBeTruthy()
		})

		it("Large Superstructure or Gondola", () => {
			expect(false).toBeTruthy()
		})

		it("Main Turret", () => {
			expect(false).toBeTruthy()
		})

		it("Mast", () => {
			expect(false).toBeTruthy()
		})

		it("Runner or Skids", () => {
			expect(false).toBeTruthy()
		})

		it("Small Superstructure or Independent Turret", () => {
			expect(false).toBeTruthy()
		})

		it("Vital Area", () => {
			expect(false).toBeTruthy()
		})

		it("Wheel", () => {
			expect(false).toBeTruthy()
		})

		it("Wings", () => {
			expect(false).toBeTruthy()
		})
	})
})

class _Attacker implements DamageAttacker {}

class _Target implements DamageTarget {
	isDiffuse = false

	isHomogenous = false

	isUnliving = false

	ST = 12

	hitPoints = { value: 15, current: 10 }

	_traits: TraitAdapter[] = []

	getTrait(name: string) {
		return this._traits.find(it => it.name === name)
	}

	hasTrait(name: string): boolean {
		return !!this.getTrait(name)
	}

	_dummyHitLocationTable = {
		name: "humanoid",
		roll: "3d",
		// eslint-disable-next-line no-array-constructor
		locations: new Array<HitLocation>(),
	}

	get hitLocationTable(): HitLocationTableWithCalc {
		return this._dummyHitLocationTable
	}
}

class _DamageRoll implements DamageRoll {
	// Not a real location id, which should be something like "torso".
	locationId = "dummy"

	attacker = new _Attacker()

	dice = new DiceGURPS("2d")

	basicDamage = 0

	damageType = DamageType.cr

	weapon = null

	range = null

	damageModifier = ""

	armorDivisor = 1

	isHalfDamage = false

	isShotgunCloseRange = false

	rofMultiplier = 1

	vulnerability = 0
}

const Knockdown = [
	{ id: "stun", margin: 0 },
	{ id: "fall prone", margin: 0 },
	{ id: "unconscious", margin: 5 },
]

type DamageShock = { damage: number; shock: number }

interface IDamageCalculator {
	basicDamage: number
	penetratingDamage: number
	injury: number
	bluntTrauma: number
	knockback: number
	injuryEffects: InjuryEffect[]
}

const _create = function (roll: DamageRoll, target: DamageTarget): IDamageCalculator {
	return new DamageCalculator(roll, target)
}
