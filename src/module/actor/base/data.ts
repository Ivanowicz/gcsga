import { ActorType, SYSTEM_NAME } from "@module/data"
import { Context } from "types/foundry/common/abstract/document.mjs"
import { ActorDataSource } from "types/foundry/common/data/data.mjs/actorData"

export interface ActorFlagsGURPS extends Record<string, unknown> {
	[SYSTEM_NAME]: Partial<Record<ActorFlags, any>>
}

export enum ActorFlags {
	TargetModifiers = "targetModifiers",
	SelfModifiers = "selfModifiers",
	Deprecation = "deprecation",
	MoveType = "move_type",
	AutoEncumbrance = "auto_encumbrance",
	AutoThreshold = "auto_threshold",
	AutoDamage = "auto_damage",
}

export interface BaseActorSourceGURPS<
	TActorType extends ActorType = ActorType,
	TSystemData extends ActorSystemData = ActorSystemData,
> extends ActorDataSource {
	name: string
	type: TActorType
	system: TSystemData
	flags: DeepPartial<ActorFlagsGURPS>
}

export interface ActorSystemData {
	id: string
	type: ActorType
}

export interface ActorConstructorContextGURPS extends Context<TokenDocument> {
	gurps?: {
		ready?: boolean
		imported?: boolean
	}
}
