import { StreamerGateway } from "../../src/controllers/StreamerGateway";
import { TableGateway } from "../../src/controllers/TableGateway";
import { client } from "../setup/DynamoDBClientSetup";

import { defaultStreamerConfig } from "../../src/models/StreamerConfig";

describe('StreamerGateway API', () => {
	const tableGateway = new TableGateway(client);
	const streamerGateway = new StreamerGateway(tableGateway);

	describe('saveStreamerConfig', () => {
		it('when saving full config then full config saved', async () => {
			await streamerGateway.saveStreamerConfig(defaultStreamerConfig);
			const config = await streamerGateway.getStreamerConfig(defaultStreamerConfig.streamerId);

			expect(config).toBeDefined();
			expect(config!).toMatchObject(defaultStreamerConfig);
		});

		it('when saving full config with custom values then saves properly', async () => {
			const myConfig = { ...defaultStreamerConfig };
			myConfig["streamerId"] = "Something";
			myConfig["streamers"] = ["Hello"];

			await streamerGateway.saveStreamerConfig(myConfig);

			const config = await streamerGateway.getStreamerConfig(myConfig.streamerId);
			expect(config).toBeDefined();
			expect(config!).toMatchObject(myConfig);
		});
	});
	describe('getStreamerConfig', () => {
		it('when getting config without saving then returns undefined', async () => {
			const config = await streamerGateway.getStreamerConfig("NotValid");
			expect(config).toEqual(undefined);
		});
	});
});
