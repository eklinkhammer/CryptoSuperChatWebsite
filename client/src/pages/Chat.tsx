import { useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import styles from "./Chat.module.css";
import btc from "../assets/btcpay-logo.svg";
import Dropdown from "./Dropdown";

interface ChatLog {
	name: string;
	message: string;
	amount: string;
	streamer: string;
	paymentMethod: string;
}

enum PaymentMethod {
	CREDIT = "Credit Card",
	BTCPAY = "BTCPay Server"
}

const Chat = ({ initialChatLogs = [] }) => {
	const { streamerId } = useParams();
	if (!streamerId) {
		throw new Error("The streamerId parameter is missing");
	}

	const streamers = [streamerId, ...window.__INITIAL_DATA__];

	const defaultDropdownValue = streamerId;
	const [dropdownValue, setDropdownValue] = useState<string>(defaultDropdownValue);

	const [formData, setFormData] = useState<ChatLog>({
		name: "",
		message: "",
		amount: "",
		paymentMethod: "Credit Card", // Default payment method
		streamer: dropdownValue,
	});

	const [chatLogs, setChatLogs] = useState<ChatLog[]>(initialChatLogs || []);
	const [errors, setErrors] = useState<Record<string, string | null>>({});

	// Streamer Selection from Dropdown
	const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setDropdownValue(event.target.value);
	};

	// Text change
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
		setErrors({
			...errors,
			[name]: null,
		});
	};

	const validateInputs = () => {
		const errors: Record<string, string> = {};
		if (!formData.name.trim()) {
			errors.name = "Name is required.";
		}
		if (!formData.message.trim()) {
			errors.message = "Message cannot be empty.";
		}
		if (!formData.amount) {
			errors.amount = "Amount is required.";
		} else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
			errors.amount = "Amount must be a positive number.";
		}
		return errors;
	};

	// Selection of payment (basically the submit)
	const handlePayment = (paymentMethod: string) => {

		const validationErrors = validateInputs();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		// Handle payment actions based on the selected payment method
		if (paymentMethod === PaymentMethod.CREDIT) {
			alert("Processing payment via Credit Card...");
		} else if (paymentMethod === PaymentMethod.BTCPAY) {
			alert("Processing payment via BTCPayServer...");
		}
		formData.paymentMethod = paymentMethod;
		formData.streamer = dropdownValue;
		// Add the new message to the chat logs
		setChatLogs([...chatLogs, formData]);

		// Reset the form
		setFormData({
			name: "",
			message: "",
			amount: "",
			paymentMethod: "Credit Card", // Reset to default payment method
			streamer: streamerId,
		});
		setDropdownValue(streamerId);
	};

	return (
		<div className={styles.container}>
		<h1 className={styles.heading}>Chat Page</h1>
		<p> Giving money to {streamerId} </p>
		<form className={styles.form}>
		<div className={styles.formGroup}>
		<label htmlFor="name" className={styles.label}>Name:</label>
		<input
		type="text"
		id="name"
		name="name"
		value={formData.name}
		onChange={handleChange}
		className={styles.input}
		required
		/>
		{errors.name && <p className={styles.error}>{errors.name}</p>}
		</div>

		<div className={styles.formGroup}>
		<label htmlFor="message" className={styles.label}>Message:</label>
		<textarea
		id="message"
		name="message"
		value={formData.message}
		onChange={handleChange}
		className={styles.textarea}
		required
		/>
		{errors.message && <p className={styles.error}>{errors.message}</p>}
		</div>

		<Dropdown
			options={streamers}
			value={dropdownValue}
			onChange={handleDropdownChange}
			label="Choose a streamer:"
			id="dropdown"
		/>

		<div className={styles.formGroup}>
		<label htmlFor="amount" className={styles.label}>Amount:</label>
		<input
		type="number"
		id="amount"
		name="amount"
		value={formData.amount}
		onChange={handleChange}
		className={styles.input}
		required
		/>
		{errors.amount && <p className={styles.error}>{errors.amount}</p>}
		</div>

		<div className={styles.paymentButtons}>
		<button
		type="button"
		className={styles.paymentButton}
		onClick={() => handlePayment(PaymentMethod.CREDIT)}
		>
		<img
		src="https://stripe.com/img/v3/home/twitter.png"
		alt="Credit Card"
		className={styles.paymentIcon}
		/>
		<span>Pay with Credit Card</span>
		</button>
		<button
		type="button"
		className={styles.paymentButton}
		onClick={() => handlePayment(PaymentMethod.BTCPAY)}
		>
		<img
		src={btc}
		alt="BTCPayServer"
		className={styles.paymentIcon}
		/>
		<span>Pay with BTCPayServer</span>
		</button>
		</div>
		</form>

		<div className={styles.chatLogs}>
		<h2>Chat Logs:</h2>
		{chatLogs.length > 0 ? (
			<ul>
			{chatLogs.map((log, index) => (
				<li key={index}>
				<strong>{log.name}:</strong> {log.message} (Amount: ${log.amount} to {log.streamer}, Payment Method: {log.paymentMethod})
				</li>
			))}
			</ul>
		) : (
		<p>No messages yet.</p>
		)}
		</div>
		</div>
	);
};

Chat.propTypes = {
	initialChatLogs: PropTypes.arrayOf(
		PropTypes.shape({
			name: PropTypes.string.isRequired,
			message: PropTypes.string.isRequired,
			amount: PropTypes.string.isRequired,
			paymentMethod: PropTypes.string.isRequired,
		})
	),
};

export default Chat;

