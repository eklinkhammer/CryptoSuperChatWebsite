export interface UnpaidMessage extends Message {
	invoiceId: string,
}

export interface PaidMessage extends UnpaidMessage {
	ttl: number,
}

export interface Message {
	streamerId: string,
	userId: string,
	userMessage: string,
	streamer: string,
	amount: number,
}
