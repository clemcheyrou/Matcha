import { useEffect, useState } from "react";
import socket from "../../../../service/socket";

type Chat = {
	id: number;
	name: string;
	user_id_1: number;
	user_id_2: number;
	audio_path: string;
	photo: string;
	last_message: string;
	last_message_created_at: string;
	last_message_is_read: boolean;
};
export const useChats = () => {
	const [chats, setChats] = useState<Chat[]>([]);
	const [error, setError] = useState(null);

	useEffect(() => {
		socket.emit("getChatsRequest");

		socket.on("chatsFetched", (chats) => {
			setChats(chats);
		});

		socket.on("error", (errorData) => {
			setError(errorData.message);
		});

		socket.on("receiveMessage", (newMessage) => {
			setChats((prevChats) => {
				return prevChats.map((chat) => {
					if (chat.id === newMessage.chat_id) {
						const lastMessageText = newMessage.audio_path 
							? 'A voice message has been sent'
							: newMessage.text;
						return {
							...chat,
							last_message: lastMessageText,
							last_message_created_at: newMessage.created_at,
						};
					}
					return chat;
				});
			});
		});

		return () => {
			socket.off("chatsFetched");
			socket.off("error");
			socket.off("receiveMessage");
		};
	}, []);

	return { chats, error };
};
