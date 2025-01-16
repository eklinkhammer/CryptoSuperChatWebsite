import { useState } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import styles from "./Chat.module.css";
import btc from "../assets/btcpay-logo.svg";
interface ChatLog {
	name: string;
	message: string;
	amount: string;
	paymentMethod: string;
}

const Chat = ({ initialChatLogs = [] }) => {
	const { streamerId } = useParams();

	const [formData, setFormData] = useState<ChatLog>({
		name: "",
		message: "",
		amount: "",
		paymentMethod: "Credit Card", // Default payment method
	});

	const [chatLogs, setChatLogs] = useState<ChatLog[]>(initialChatLogs || []);
	const [errors, setErrors] = useState<Record<string, string | null>>({});

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

	const handlePayment = () => {
		const validationErrors = validateInputs();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		// Handle payment actions based on the selected payment method
		if (formData.paymentMethod === "Credit Card") {
			alert("Processing payment via Credit Card...");
		} else if (formData.paymentMethod === "BTCPayServer") {
			alert("Processing payment via BTCPayServer...");
		}

		// Add the new message to the chat logs
		setChatLogs([...chatLogs, formData]);

		// Reset the form
		setFormData({
			name: "",
			message: "",
			amount: "",
			paymentMethod: "Credit Card", // Reset to default payment method
		});
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
		onClick={() => handlePayment("Credit Card")}
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
		onClick={() => handlePayment("BTCPayServer")}
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
				<strong>{log.name}:</strong> {log.message} (Amount: ${log.amount}, Payment Method: {log.paymentMethod})
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

