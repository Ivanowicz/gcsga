import { ActorGURPS } from "@actor"
import { ItemGURPS } from "@item"
import { MigrationList, MigrationRunner } from "@module/migration/index.ts"
import { UserGURPS } from "@module/user/document.ts"
import * as R from "remeda"

class ClientDatabaseBackendGURPS extends ClientDatabaseBackend {
	protected override async _getDocuments(
		documentClass: typeof foundry.abstract.Document,
		context: DatabaseBackendGetContext,
		user: UserGURPS,
	): Promise<(DeepPartial<ClientDocument["_source"]> & CompendiumIndexData)[] | foundry.abstract.Document[]> {
		const type = documentClass.documentName
		if (!["Actor", "Item"].includes(type) || context.pack?.startsWith("gcsga.") || context.options?.index) {
			return super._getDocuments(documentClass, context, user)
		}

		// Dispatch the request
		const request = { action: "get", type, ...R.pick(context, ["query", "options", "pack"]) }
		const response = await SocketInterface.dispatch("modifyDocument", request)

		// Create Document objects
		return Promise.all(
			response.result.map(async data => {
				const document = documentClass.fromSource(data, { pack: context.pack }) as ActorGURPS | ItemGURPS
				const migrations = MigrationList.constructFromVersion(document.schemaVersion)
				if (migrations.length > 0) {
					try {
						await MigrationRunner.ensureSchemaVersion(document, migrations)
					} catch (error) {
						if (error instanceof Error) console.error(error.message)
					}
				}

				return document
			}),
		)
	}
}

export { ClientDatabaseBackendGURPS }
