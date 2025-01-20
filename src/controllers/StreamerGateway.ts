import { StreamerConfig, defaultStreamerConfig } from "../models/StreamerConfig";
import { TableGateway } from "./TableGateway";

export class StreamerGateway {
	private readonly CONFIG_HASH_KEY_VALUE = "CONFIG";
	private tableGateway: TableGateway;

	constructor(gateway: TableGateway) {
		this.tableGateway = gateway;
	}

	async getStreamerConfig(streamerId: string): Promise<StreamerConfig | undefined> {
		return this.tableGateway.get<StreamerConfig>(streamerId, this.CONFIG_HASH_KEY_VALUE);
	}

	async saveStreamerConfig(config: { streamerId: string}) {
		return this.tableGateway.save(
			{
				...defaultStreamerConfig,
				...config,
			},
			this.CONFIG_HASH_KEY_VALUE,
		);
	}

	
	/**
	 * Returns the list of streamer names that can appear in dropdown menu for
	 *   user, if they want to select one. Defaults to streamerId.
	 *
	 * @param {string} streamerId Partition key identifying StreamerConfig
	 */
	async getStreamerOptions(streamerId: string): Promise<string[]> {
		const streamerConfig = await this.getStreamerConfig(streamerId);
		if (!streamerConfig) {
			throw new Error(`Streamer with ID: ${streamerId} does not exist`);
		}

		return streamerConfig.streamers;
	}
}

