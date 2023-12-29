import { BaseItemSourceGURPS } from "@item/base"
import { ItemType } from "@module/data"
import { SkillDefault } from "@module/default"

export type BaseWeaponSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends BaseWeaponSystemData = BaseWeaponSystemData,
> = BaseItemSourceGURPS<TItemType, TSystemData>

export interface WeaponDamageObj {
	type: string
	st: StrengthDamage
	base: string
	armor_divisor: number
	fragmentation: string
	fragmentation_armor_divisor: number
	fragmentation_type: string
	modifier_per_die: number
}

export interface BaseWeaponSystemData {
	id: string
	type: WeaponType
	strength: string
	usage: string
	usage_notes: string
	defaults: SkillDefault[]
	damage: WeaponDamageObj
}

export type WeaponType = ItemType.MeleeWeapon | ItemType.RangedWeapon

export enum StrengthDamage {
	None = "none",
	Thrust = "thr",
	ThrustLeveled = "thr_leveled",
	Swing = "sw",
	SwingLeveled = "sw_leveled",
}

export interface WeaponStrength {
	min: number
	bipod: boolean
	mounted: boolean
	musketRest: boolean
	twoHanded: boolean
	twoHandedUnready: boolean
}
