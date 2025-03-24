import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.SESSION_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.SESSION_SECRET,);
};
