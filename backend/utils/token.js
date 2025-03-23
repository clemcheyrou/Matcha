import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
    return jwt.sign({ userId }, '1234', { expiresIn: '1d' });
};

export const verifyToken = (token) => {
    return jwt.verify(token, '1234');
};
