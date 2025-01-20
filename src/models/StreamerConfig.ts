export interface StreamerConfig {
	streamerId: string;
	name: string;
	email: string;
	streamers: string[];
	chatTimeout: TimeoutConfig[];
	paymentSetup: PaymentSetup;
}

export const defaultStreamerConfig: StreamerConfig = {
	streamerId: "DefaultStreamerId",
	name: "DefaultName",
	email: "default@default.com",
	streamers: [],
	chatTimeout: [
		{
			amount: 50,
			timeout: 180,
		},
		{
			amount: 25,
			timeout: 120,
		},
		{
			amount: 10,
			timeout: 60,
		},
		{
			amount: 0,
			timeout: 0
		}
	],
	paymentSetup: {},
};


export interface PaymentSetup {
	crypto?: CryptoSetup;
}

export interface CryptoSetup {
	bitcoin?: Wallet;
	ltc?: Wallet;
}

export interface Wallet {
	xpub?: string;
	publicKey: string;
}

// If you donate at least amount, you get a timeout of timeout before your message disappears
export interface TimeoutConfig {
	amount: number;
	timeout: number;
}

