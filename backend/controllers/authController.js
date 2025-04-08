import bcrypt from "bcryptjs";
import { getUserByEmail, createUser, updateUserVerification, getUserByUsername } from "../models/userModel.js";
import { generateToken, verifyToken } from "../utils/token.js";
import { sendConfirmationEmail, sendResetPasswordEmail } from "../utils/emailSender.js";
import { updateUserPassword } from "../models/authModel.js";
import pool from "../utils/db.js";
import { io, users } from "../index.js";

export const register = async (req, res) => {
	const { username, lastname, firstname, email, password } = req.body;
    console.log("BACK = Données reçues :", req.body);

	try {
		if (!lastname || !firstname || !username || !email || !password)
			return res.status(400).json({ message: "all fields are required." });
		const user = await getUserByEmail(email); 
		if (user)
            return res.status(409).json({ message: "email_exists" });
		const pseudo = await getUserByUsername(username);
        if (pseudo)
            return res.status(409).json({ message: "username_exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
		const userId = await createUser(
			username,
			lastname,
			firstname,
			email,
			hashedPassword,
		);

		const token = generateToken(userId);
		await sendConfirmationEmail(email, token);
		res.status(201).json({ success: "true", message: "registration successful"});
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: "false", message: "server error" });
	}
};

export const handleEmailConfirmation = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = verifyToken(token);
        await updateUserVerification(decoded.userId);
        
		req.session.userId = decoded.userId;
		return res.json({ success: true });
    } catch (error) {
        console.error(error);
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await getUserByUsername(username);
        
        if (!user)
            return res
                .status(400)
                .json({ message: "incorrect username or password" });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch)
            return res
                .status(400)
                .json({ message: "incorrect username or password" });

        req.session.userId = user.id;
        res.status(200).json({ success: true, message: "successful connection" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "server error" });
    }
};


export const logout = async (req, res) => {
	const userId = req.session.userId;

	req.session.destroy(async (err) => {
		if (err) return res.status(500).json({ message: "error while disconnecting" });
		await pool.query("UPDATE users SET is_connected = FALSE, last_connected_at = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
		res.clearCookie("connect.sid");
		res.status(200).json({ message: "Successful disconnection" });
	});
};

export const sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) return res.status(400).json({ message: "email required" });

        const user = await getUserByEmail(email);
        if (!user) return res.status(404).json({ message: "user not found" });

        const token = generateToken(user.id, "1h");
        await sendResetPasswordEmail(email, token);

        res.json({ message: "password reset email sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "server error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) return res.status(400).json({ message: "all fields are required" });

        const decoded = verifyToken(token);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await updateUserPassword(decoded.userId, hashedPassword);
        res.json({ message: "password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "invalid or expired token" });
    }
};

