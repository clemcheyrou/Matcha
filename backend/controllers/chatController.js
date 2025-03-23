import {
	addNewChat,
	checkChat,
	getAllChats,
	getAllMessagesFromChat,
	getChatInfo,
	markMessagesAsRead,
} from "../models/chatModel.js";

export const createNewChatController = async (req, res) => {
	const { userId2 } = req.body;
	const currentUserId = req.session.userId;
	if (!currentUserId || !userId2)
		return res.status(400).json({ error: "can not find both users" });

	try {
		const chatCheckResult = await checkChat(currentUserId, userId2);
		if (chatCheckResult.length > 0)
			return res.status(200).json(`/chat/${chatCheckResult[0].id}`);
		const newChatId = await addNewChat(currentUserId, userId2);
		res.status(200).json(`/chat/${newChatId}`);
		io.emit("CHAT_CREATED", {
			chat: { id: newChatId, user1: currentUserId, user2: userId2 },
		});
	} catch (error) {
		res.status(500).json({ error: "error when creating the conversation" });
	}
};

export const getChatListController = async (req, res) => {
	const currentUserId = req.session.userId;

	if (!currentUserId)
		return res.status(400).json({ error: "can not find user" });

	try {
		const chatList = await getAllChats(currentUserId);
		if (chatList.length > 0)
			return res.status(401).json({ message: "no chats" });
		res.status(200).json(chatList);
	} catch (error) {
		res.status(500).json({ error: "error to get chat list" });
	}
};

export const getChatHeaderController = async (req, res) => {
	const currentUserId = req.session.userId;
	const { chatId } = req.params;

	if (!currentUserId)
		return res.status(400).json({ error: "can not find user" });

	try {
		const chatInfo = await getChatInfo(chatId);
		const userName =
			currentUserId === chatInfo.user_1_id
				? chatInfo.user_2_name
				: chatInfo.user_1_name;
		const userImage =
			currentUserId === chatInfo.user_1_id
				? chatInfo.user_2_profile_photo
				: chatInfo.user_1_profile_photo;
		return res.json({ name: userName, profileImage: userImage });
	} catch (error) {
		res.status(500).json({ error: "error to get chat info" });
	}
};

export const markMessagesAsReadController = async (req, res) => {
	const currentUserId = req.session.userId;
	const { chatId } = req.params;

	try {
		const updatedCount = await markMessagesAsRead(chatId, currentUserId);
		if (updatedCount === 0) {
			return res
				.status(404)
				.json({ message: "no unread messages for this chat" });
		}

		res.status(200).json({ message: "messages marked as read" });
	} catch (error) {
		res.status(500).json({ error: "failed to mark messages as read" });
	}
};

export const getMessagesController = async (req, res) => {
	const currentUserId = req.session.userId;
	const { chatId } = req.params;
	if (!currentUserId)
		return res.status(401).json({ error: "can not find user" });
	if (!chatId) {
		return res.status(400).json({ error: "chat ID is required" });
	}

	try {
		const chatMessages = await getAllMessagesFromChat(chatId);
		if (chatMessages.length === 0) return res.status(200).json([]);
		res.status(200).json(chatMessages);
	} catch (error) {
		res.status(500).json({ error: "error to get chat list" });
	}
};
