/* eslint-disable jest/no-disabled-tests */
import { DamageAttacker, DamageRoll } from "@module/damage_calculator"
import { Extremity, Head, Limb } from "@module/damage_calculator/damage_calculator"
import { DamageType, DamageTypes } from "@module/damage_calculator/damage_type"
import { DiceGURPS } from "@module/dice"
import { DamageHitLocation, _Attacker, _DamageRoll, _Target, _create } from "./common"

// Add real tests here.
describe("Damage calculator", () => {
	let _attacker: DamageAttacker
	let _target: _Target
	let _roll: DamageRoll

	let _torso: DamageHitLocation
	let _vitals: DamageHitLocation
	let _skull: DamageHitLocation
	let _eye: DamageHitLocation
	let _face: DamageHitLocation
	let _neck: DamageHitLocation
	let _groin: DamageHitLocation
	let _arm: DamageHitLocation
	let _leg: DamageHitLocation
	let _hand: DamageHitLocation
	let _foot: DamageHitLocation
	const locations = ["groin", "vitals", "neck", ...Head, ...Limb, ...Extremity]

	beforeEach(() => {
		_attacker = new _Attacker()
		_target = new _Target()
		_roll = new _DamageRoll()
		_roll.attacker = _attacker
		_roll.basicDamage = 8
		_roll.armorDivisor = 1
		_roll.damageType = DamageTypes.cr
		_roll.dice = new DiceGURPS("2d")
		_roll.locationId = "torso"

		_torso = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Torso",
			description: "",
			dr_bonus: 0,
			table_name: "Torso",
			hit_penalty: 0,
			id: "torso",
			slots: 2,
		})

		_vitals = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Vitals",
			description: "",
			dr_bonus: 0,
			table_name: "Vitals",
			hit_penalty: -3,
			id: "vitals",
			slots: 0,
		})

		_skull = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Skull",
			description: "",
			dr_bonus: 2,
			table_name: "Skull",
			hit_penalty: -7,
			id: "skull",
			slots: 0,
		})

		_eye = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Eye",
			description: "",
			dr_bonus: 0,
			table_name: "Eye",
			hit_penalty: -9,
			id: "eye",
			slots: 0,
		})

		_face = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Face",
			description: "",
			dr_bonus: 0,
			table_name: "Face",
			hit_penalty: -5,
			id: "face",
			slots: 1,
		})

		_neck = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Face",
			description: "",
			dr_bonus: 0,
			table_name: "Face",
			hit_penalty: -5,
			id: "face",
			slots: 1,
		})

		_groin = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Face",
			description: "",
			dr_bonus: 0,
			table_name: "Face",
			hit_penalty: -5,
			id: "face",
			slots: 1,
		})

		_arm = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Right Arm",
			description: "",
			dr_bonus: 0,
			table_name: "Right Arm",
			hit_penalty: -2,
			id: "arm",
			slots: 1,
		})

		_leg = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Right Leg",
			description: "",
			dr_bonus: 0,
			table_name: "Right Leg",
			hit_penalty: -2,
			id: "leg",
			slots: 2,
		})

		_hand = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Hand",
			description: "",
			dr_bonus: 0,
			table_name: "Hand",
			hit_penalty: -4,
			id: "hand",
			slots: 1,
		})

		_foot = new DamageHitLocation(_target, _target.hitLocationTable, {
			choice_name: "Foot",
			description: "",
			dr_bonus: 0,
			table_name: "Foot",
			hit_penalty: -4,
			id: "foot",
			slots: 1,
		})

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
			_roll.locationId = "torso"
			let calc = _create(_roll, _target)

			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "8", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "0", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "8", notes: "= 8 – 0" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
				{ substep: "gurps.damage.substep.injury", text: "8", notes: "= 8 × 1" },
			])
		})

		it.skip("(Knockback Only does no damage.)", () => {
			_roll.basicDamage = 8
			_roll.damageType = DamageTypes.kb
			let calc = _create(_roll, _target)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "8", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "0", notes: "Knockback only" },
				{ substep: "gurps.damage.substep.penetrating", text: "8", notes: "= 8 – 0" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "gurps.damage.type.cr" },
				{ substep: "gurps.damage.substep.injury", text: "0", notes: "Knockback only" },
			])
		})
	})

	describe("B378: Damage Resistance and Penetration. Subtract DR from basic damage. The result is the “penetrating damage”", () => {
		it("If your target has any Damage Resistance (DR) he subtracts this from your damage roll.", () => {
			_roll.basicDamage = 8
			_torso._map.set("all", 2)

			let calc = _create(_roll, _target)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "8", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "2", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 8 – 2" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
				{ substep: "gurps.damage.substep.injury", text: "6", notes: "= 6 × 1" },
			])
		})

		it("If your damage roll is less than or equal to your target’s effective DR, your attack failed to penetrate.", () => {
			_roll.basicDamage = 5
			_torso._map.set("all", 9)

			let calc = _create(_roll, _target)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "5", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "9", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "0", notes: "= 5 – 9" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
				{ substep: "gurps.damage.substep.injury", text: "0", notes: "= 0 × 1" },
			])
		})

		it("(Direct Injury ignores DR.)", () => {
			_roll.damageType = DamageTypes.injury
			_torso._map.set("all", 9)

			_roll.basicDamage = 8
			let calc = _create(_roll, _target)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "8", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "9", notes: "Torso" },
				{ substep: "gurps.damage.substep.effective_dr", text: "0", notes: "Ignores DR" },
				{ substep: "gurps.damage.substep.penetrating", text: "8", notes: "= 8 – 0" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "injury, torso" },
				{ substep: "gurps.damage.substep.injury", text: "8", notes: "= 8 × 1" },
			])
		})
	})

	describe("B378: Armor Divisors and Penetration Modifiers.", () => {
		beforeEach(() => {
			_roll.basicDamage = 20
		})

		describe("A divisor of (2) or more means that DR protects at reduced value against the attack.", () => {
			it("Divide the target’s DR by the number in parentheses before subtracting it from basic damage; e.g., (2) means DR protects at half value.", () => {
				_torso._map.set("all", 20)
				_roll.armorDivisor = 2
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "20", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "20", notes: "Torso" },
					{ substep: "gurps.damage.substep.effective_dr", text: "10", notes: "Armor Divisor (2)" },
					{ substep: "gurps.damage.substep.penetrating", text: "10", notes: "= 20 – 10" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
					{ substep: "gurps.damage.substep.injury", text: "10", notes: "= 10 × 1" },
				])

				_roll.armorDivisor = 0.5
				calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "20", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "20", notes: "Torso" },
					{ substep: "gurps.damage.substep.effective_dr", text: "40", notes: "Armor Divisor (0.5)" },
					{ substep: "gurps.damage.substep.penetrating", text: "0", notes: "= 20 – 40" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
					{ substep: "gurps.damage.substep.injury", text: "0", notes: "= 0 × 1" },
				])
			})

			it("(Ignores DR.)", () => {
				_torso._map.set("all", 20)
				_roll.armorDivisor = 0
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "20", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "20", notes: "Torso" },
					{ substep: "gurps.damage.substep.effective_dr", text: "0", notes: "Armor Divisor (Ignores DR)" },
					{ substep: "gurps.damage.substep.penetrating", text: "20", notes: "= 20 – 0" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
					{ substep: "gurps.damage.substep.injury", text: "20", notes: "= 20 × 1" },
				])
			})
		})

		describe("Some divisors are fractions, such as (0.5), (0.2), or (0.1). DR is increased against such attacks:", () => {
			it("... multiply DR by 2 for (0.5),", () => {
				_torso._map.set("all", 5)

				_roll.armorDivisor = 0.5
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "20", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.effective_dr", text: "10", notes: "Armor Divisor (0.5)" },
					{ substep: "gurps.damage.substep.penetrating", text: "10", notes: "= 20 – 10" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
					{ substep: "gurps.damage.substep.injury", text: "10", notes: "= 10 × 1" },
				])
			})

			it("In addition, if you have any level of this limitation, targets that have DR 0 get DR 1 against your attack.", () => {
				_torso._map.set("all", 0)
				_roll.armorDivisor = 0.5
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "20", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "0", notes: "Torso" },
					{ substep: "gurps.damage.substep.effective_dr", text: "1", notes: "Armor Divisor (0.5)" },
					{ substep: "gurps.damage.substep.penetrating", text: "19", notes: "= 20 – 1" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, torso" },
					{ substep: "gurps.damage.substep.injury", text: "19", notes: "= 19 × 1" },
				])
			})
		})
	})

	describe("B379: Wounding Modifiers and Injury. If there is any penetrating damage, multiply it by the attack’s “wounding modifier.”", () => {
		beforeEach(() => {
			_torso._map.set("all", 5)
			_roll.basicDamage = 11
		})

		it("Small piercing (pi-): ×0.5.", () => {
			_roll.damageType = DamageTypes["pi-"]
			let calc = _create(_roll, _target)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "11", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 11 – 5" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1/2", notes: "pi-, torso" },
				{ substep: "gurps.damage.substep.injury", text: "3", notes: "= 6 × 1/2" },
			])
		})
	})

	describe("B379: Flexible Armor and Blunt Trauma. An attack that does crushing, cutting, impaling, or piercing damage may inflict “blunt trauma” if it fails to penetrate flexible DR.", () => {
		beforeEach(() => {
			_torso._map.set("all", 20)
		})

		it("For every full 10 points of cutting, impaling, or piercing damage stopped by your DR, you suffer 1 HP of injury due to blunt trauma.", () => {
			_roll.damageType = DamageTypes.cut
			_roll.basicDamage = 9
			let calc = _create(_roll, _target)
			calc.overrideFlexible(true)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "9", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "0", notes: "= 9 – 20" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1.5", notes: "cut, torso" },
				{ substep: "gurps.damage.substep.injury", text: "0", notes: "= 0 × 1.5" },
			])

			_roll.basicDamage = 10
			calc = _create(_roll, _target)
			calc.overrideFlexible(true)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "10", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "0", notes: "= 10 – 20" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1.5", notes: "cut, torso" },
				{ substep: "gurps.damage.substep.injury", text: "0", notes: "= 0 × 1.5" },
				{ substep: "gurps.damage.substep.adjusted_injury", text: "1", notes: "Blunt Trauma" },
			])

			_roll.basicDamage = 20
			calc = _create(_roll, _target)
			calc.overrideFlexible(true)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "20", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "0", notes: "= 20 – 20" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1.5", notes: "cut, torso" },
				{ substep: "gurps.damage.substep.injury", text: "0", notes: "= 0 × 1.5" },
				{ substep: "gurps.damage.substep.adjusted_injury", text: "2", notes: "Blunt Trauma" },
			])
		})

		it("If even one point of damage penetrates your flexible DR, however, you do not suffer blunt trauma.", () => {
			_roll.damageType = DamageTypes["pi-"]
			_roll.basicDamage = 21
			let calc = _create(_roll, _target)
			calc.overrideFlexible(true)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "21", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "20", notes: "Torso" },
				{ substep: "gurps.damage.substep.penetrating", text: "1", notes: "= 21 – 20" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1/2", notes: "pi-, torso" },
				{ substep: "gurps.damage.substep.injury", text: "1", notes: "= 1 × 1/2" },
			])
		})
	})

	describe("B380: Injury to Unliving, Homogenous, and Diffuse Targets.", () => {
		describe("Unliving.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Unliving"
				_roll.locationId = "torso"
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1; ...", () => {
				_roll.damageType = DamageTypes.imp
				_roll.basicDamage = 11
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "11", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×2", notes: "imp, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1", notes: "Unliving" },
					{ substep: "gurps.damage.substep.injury", text: "6", notes: "= 6 × 1" },
				])

				_roll.damageType = DamageTypes["pi++"]
				calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "11", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×2", notes: "pi++, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1", notes: "Unliving" },
					{ substep: "gurps.damage.substep.injury", text: "6", notes: "= 6 × 1" },
				])
			})

			it("... large piercing, ×1/2;", () => {
				_roll.damageType = DamageTypes["pi+"]
				_roll.basicDamage = 11
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "11", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1.5", notes: "pi+, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1/2", notes: "Unliving" },
					{ substep: "gurps.damage.substep.injury", text: "3", notes: "= 6 × 1/2" },
				])
			})

			it("... piercing, ×1/3;", () => {
				_roll.damageType = DamageTypes.pi
				_roll.basicDamage = 11
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "11", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "pi, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1/3", notes: "Unliving" },
					{ substep: "gurps.damage.substep.injury", text: "2", notes: "= 6 × 1/3" },
				])
			})

			it("... and small piercing, ×1/5.", () => {
				_roll.damageType = DamageTypes["pi-"]
				_roll.basicDamage = 15
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "15", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "10", notes: "= 15 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1/2", notes: "pi-, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1/5", notes: "Unliving" },
					{ substep: "gurps.damage.substep.injury", text: "2", notes: "= 10 × 1/5" },
				])
			})
		})

		describe("Homogenous.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Homogenous"
			})

			it("This gives impaling and huge piercing a wounding modifier of ×1/2; ...", () => {
				let types = [DamageTypes.imp, DamageTypes["pi++"]]
				for (const type of types) {
					_roll.damageType = type
					_roll.basicDamage = 11
					let calc = _create(_roll, _target)
					expect(calc.results.steps).toMatchObject([
						{
							substep: "gurps.damage.substep.basic_damage",
							text: "11",
							notes: "gurps.damage.damage_pool.hp",
						},
						{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
						{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 11 – 5" },
						{ substep: "gurps.damage.substep.wounding_modifier", text: "×2", notes: `${type.key}, torso` },
						{ substep: "gurps.damage.substep.injury_tolerance", text: "×1/2", notes: "Homogenous" },
						{ substep: "gurps.damage.substep.injury", text: "3", notes: "= 6 × 1/2" },
					])
				}
			})

			it("... large piercing, ×1/3;", () => {
				_roll.damageType = DamageTypes["pi+"]
				_roll.basicDamage = 11
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "11", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "6", notes: "= 11 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1.5", notes: "pi+, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1/3", notes: "Homogenous" },
					{ substep: "gurps.damage.substep.injury", text: "2", notes: "= 6 × 1/3" },
				])
			})

			it("... piercing, ×1/5;", () => {
				_roll.damageType = DamageTypes.pi
				_roll.basicDamage = 15
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "15", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "10", notes: "= 15 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "pi, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1/5", notes: "Homogenous" },
					{ substep: "gurps.damage.substep.injury", text: "2", notes: "= 10 × 1/5" },
				])
			})

			it("... and small piercing, ×1/10.", () => {
				_roll.damageType = DamageTypes["pi-"]
				_roll.basicDamage = 15
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "15", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "10", notes: "= 15 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1/2", notes: "pi-, torso" },
					{ substep: "gurps.damage.substep.injury_tolerance", text: "×1/10", notes: "Homogenous" },
					{ substep: "gurps.damage.substep.injury", text: "1", notes: "= 10 × 1/10" },
				])
			})
		})

		describe("Diffuse.", () => {
			beforeEach(() => {
				_torso._map.set("all", 5)
				_target.injuryTolerance = "Diffuse"
				_roll.basicDamage = 100
			})

			it("Impaling and piercing attacks (of any size) never do more than 1 HP of injury.", () => {
				let types: Array<[DamageType, string]> = [
					[DamageTypes.imp, "2"],
					[DamageTypes["pi++"], "2"],
					[DamageTypes["pi+"], "1.5"],
					[DamageTypes.pi, "1"],
					[DamageTypes["pi-"], "1/2"],
				]
				for (const type of [types[0], types[1]]) {
					_roll.damageType = type[0]
					let calc = _create(_roll, _target)
					expect(calc.results.steps).toMatchObject([
						{
							substep: "gurps.damage.substep.basic_damage",
							text: "100",
							notes: "gurps.damage.damage_pool.hp",
						},
						{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
						{ substep: "gurps.damage.substep.penetrating", text: "95", notes: "= 100 – 5" },
						{
							substep: "gurps.damage.substep.wounding_modifier",
							text: "×2",
							notes: `${type[0].key}, torso`,
						},
						{ substep: "gurps.damage.substep.injury", text: "190", notes: "= 95 × 2" },
						{ substep: "gurps.damage.substep.adjusted_injury", text: "1", notes: "Maximum 1 (Diffuse)" },
					])
				}

				_roll.damageType = DamageTypes["pi+"]
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "100", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "95", notes: "= 100 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1.5", notes: "pi+, torso" },
					{ substep: "gurps.damage.substep.injury", text: "142", notes: "= 95 × 1.5" },
					{ substep: "gurps.damage.substep.adjusted_injury", text: "1", notes: "Maximum 1 (Diffuse)" },
				])

				_roll.damageType = DamageTypes.pi
				calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "100", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "95", notes: "= 100 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "pi, torso" },
					{ substep: "gurps.damage.substep.injury", text: "95", notes: "= 95 × 1" },
					{ substep: "gurps.damage.substep.adjusted_injury", text: "1", notes: "Maximum 1 (Diffuse)" },
				])

				_roll.damageType = DamageTypes["pi-"]
				calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "100", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "95", notes: "= 100 – 5" },
					{ substep: "gurps.damage.substep.wounding_modifier", text: "×1/2", notes: "pi-, torso" },
					{ substep: "gurps.damage.substep.injury", text: "47", notes: "= 95 × 1/2" },
					{ substep: "gurps.damage.substep.adjusted_injury", text: "1", notes: "Maximum 1 (Diffuse)" },
				])
			})

			it("Other attacks can never do more than 2 HP of injury.", () => {
				let types: Array<[DamageType, number]> = [
					[DamageTypes.burn, 1],
					[DamageTypes.cor, 1],
					[DamageTypes.cr, 1],
					[DamageTypes.cut, 1.5],
					//	[DamageTypes.fat, 1],
					[DamageTypes.tox, 1],
				]
				for (const type of types) {
					_roll.damageType = type[0]
					let calc = _create(_roll, _target)
					expect(calc.results.steps).toMatchObject([
						{
							substep: "gurps.damage.substep.basic_damage",
							text: "100",
							notes: "gurps.damage.damage_pool.hp",
						},
						{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
						{ substep: "gurps.damage.substep.penetrating", text: "95", notes: "= 100 – 5" },
						{
							substep: "gurps.damage.substep.wounding_modifier",
							text: `×${type[1]}`,
							notes: `${type[0].key}, torso`,
						},
						{
							substep: "gurps.damage.substep.injury",
							text: `${Math.floor(95 * type[1])}`,
							notes: `= 95 × ${type[1]}`,
						},
						{ substep: "gurps.damage.substep.adjusted_injury", text: "2", notes: "Maximum 2 (Diffuse)" },
					])
				}

				_roll.damageType = DamageTypes.fat
				let calc = _create(_roll, _target)
				expect(calc.results.steps).toMatchObject([
					{ substep: "gurps.damage.substep.basic_damage", text: "100", notes: "gurps.damage.damage_pool.hp" },
					{ substep: "gurps.damage.substep.damage_resistance", text: "5", notes: "Torso" },
					{ substep: "gurps.damage.substep.penetrating", text: "95", notes: "= 100 – 5" },
					{
						substep: "gurps.damage.substep.wounding_modifier",
						text: "×1",
						notes: "Fatigue ignores Hit Location",
					},
					{ substep: "gurps.damage.substep.injury", text: "95", notes: "= 95 × 1" },
					{ substep: "gurps.damage.substep.adjusted_injury", text: "2", notes: "Maximum 2 (Diffuse)" },
				])
			})
		})
	})

	describe("Arm or Leg.", () => {
		beforeEach(() => {
			_roll.basicDamage = 6
		})
		it("...but damage beyond the minimum required to inflict a crippling injury is lost.", () => {
			_roll.locationId = "arm"

			_target.hitPoints.value = 15
			_roll.basicDamage = 10
			_roll.damageType = DamageTypes.cr
			let calc = _create(_roll, _target)
			expect(calc.results.steps).toMatchObject([
				{ substep: "gurps.damage.substep.basic_damage", text: "10", notes: "gurps.damage.damage_pool.hp" },
				{ substep: "gurps.damage.substep.damage_resistance", text: "0", notes: "Right Arm" },
				{ substep: "gurps.damage.substep.penetrating", text: "10", notes: "= 10 – 0" },
				{ substep: "gurps.damage.substep.wounding_modifier", text: "×1", notes: "cr, arm" },
				{ substep: "gurps.damage.substep.injury", text: "10", notes: "= 10 × 1" },
				{ substep: "gurps.damage.substep.adjusted_injury", text: "8", notes: "Maximum 8 (arm)" },
			])
		})
	})
})
