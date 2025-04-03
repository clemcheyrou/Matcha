import React, { useRef, useEffect } from "react";

type Message = {
	id: number;
	text?: string;
	sender: string;
	isSender: boolean;
	author_id: number;
	created_at: string;
	chat_id: number;
	audio_path?: string;
};

type MessageList = {
	messages: Message[];
};

export const MessageList: React.FC<MessageList> = ({ messages }) => {
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView();
		}
	}, [messages]);
	return (
		<div className="flex-1 overflow-y-auto p-4 mb-2 bg-bg min-h-[60vh] rounded-lg">
			{messages.length > 0 ? (
				messages.map((msg) => (
					<div
						key={msg.id}
						className={`flex ${
							msg.isSender ? "justify-end" : "justify-start"
						} mb-4`}
					>
						<div
							className={`max-w-xs px-3 py-1 rounded-lg ${
								msg.isSender
									? "bg-pink text-white"
									: "bg-gray-200 text-gray-800"
							}`}
						>
							{msg.text}
							{msg.audio_path && (
								<audio
									controls
									src={`${process.env.REACT_APP_API_URL}/${msg.audio_path}`}
								></audio>
							)}
						</div>
					</div>
				))
			) : (
				<div className="text-center text-sm">
					No messages yet...
				</div>
			)}
			<div ref={messagesEndRef} />
		</div>
	);
};
