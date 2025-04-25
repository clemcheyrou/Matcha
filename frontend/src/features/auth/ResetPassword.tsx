import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ResetPassword = () => {
	const [newPassword, setNewPassword] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const location = useLocation();

	const searchParams = new URLSearchParams(location.search);
	const token = searchParams.get("token");
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			setMessage("token is missing");
		}
	}, [token]);

	const handlePasswordChange = (e) => {
		const password = e.target.value;
		setNewPassword(password);
	  
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
		if (!passwordRegex.test(password)) {
		  setMessage("Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.");
		} else {
		  setMessage("");
		}
	  };

	const handleSubmit = async (e) => {
		e.preventDefault();

		setMessage("");

		if (!newPassword) {
			setMessage("please enter a new password");
			return;
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
		if (!passwordRegex.test(newPassword)) {
		  setMessage("Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.");
		  return;
		}

		if (!token) {
			setMessage("token is missing");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/auth/reset-password`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ token, newPassword }),
				}
			);

			const data = await response.json();

			if (response.ok) {
				setMessage(data.message || "password reset successful");
				navigate("/login");
			} else {
				setMessage(data.message || "failed to reset password");
			}
		} catch (error) {
			console.error(error);
			setMessage("server error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen">
			<div className="bg-bg p-6 rounded-lg shadow-md w-96">
				<h2 className="text-2xl font-semibold text-center mb-4">
					Reset Password
				</h2>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label
							htmlFor="newPassword"
							className="block text-sm font-medium text-gray-700"
						>
							New Password
						</label>
						<input
							type="password"
							id="newPassword"
							name="newPassword"
							value={newPassword}
							onChange={handlePasswordChange}
							required
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink focus:border-pink"
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full py-2 px-4 bg-pink text-white rounded-md hover:bg-pink focus:outline-none focus:ring-2 focus:ring-pink focus:ring-opacity-50"
					>
						{loading ? "Submitting..." : "Submit New Password"}
					</button>
				</form>
				{message && (
					<p className="mt-4 text-center text-white">{message}</p>
				)}
			</div>
		</div>
	);
};
