import React, { useEffect, useRef, useState } from "react";
import socket from "../../../../service/socket";
import { AiOutlineAudio } from "react-icons/ai";
import { BsSend } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { EventPlanning } from "./EventPlanning.tsx";

interface MessageInputProps {
	newMessage: string;
	setNewMessage: (message: string) => void;
	sendMessage: () => void;
	sendAudio: (audioUrl: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
	newMessage,
	setNewMessage,
	sendMessage,
	sendAudio,
}) => {
	const [isRecording, setIsRecording] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const { chatId } = useParams<{ chatId: string }>();

	const startRecording = async () => {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: true,
		});
		mediaRecorderRef.current = new MediaRecorder(stream);
		const audioChunks: Blob[] = [];

		mediaRecorderRef.current.ondataavailable = (event) => {
			audioChunks.push(event.data);
		};

		mediaRecorderRef.current.onstop = () => {
			const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
			socket.emit("audio-message", {
				chat_id: Number(chatId),
				audio: audioBlob,
			});
		};

		mediaRecorderRef.current.start();
		setIsRecording(true);
	};

	useEffect(() => {
		socket.on("audio-url", (data) => {
			sendAudio(data);
		});

		return () => {
			socket.off("audio-url");
		};
		// eslint-disable-next-line
	}, []);

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();
		setIsRecording(false);
	};


	return (
		<div className="pt-2 pb-6">
			<div className="flex items-center gap-4">
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Type a message..."
					className="flex-1 bg-bg rounded-lg px-4 py-2 outline-none text-white text-sm"
					onKeyDown={(e) => {
						if (e.key === 'Enter' && newMessage.trim() !== '') {
							sendMessage();
						}
					}}
				/>
				<EventPlanning/>
				<div>
					{!isRecording ? (
						<button
							onClick={startRecording}
							className="flex items-center gap-2 p-2 text-gray-800 bg-gray-200 rounded-lg"
						>
							<AiOutlineAudio />
						</button>
					) : (
						<button
							onClick={stopRecording}
							className="flex items-center gap-2 p-2 text-gray-800 bg-red-500 rounded-lg animate-pulse"
						>
							<AiOutlineAudio />
						</button>
					)}
				</div>
				<button
					onClick={() => {
						if (newMessage.trim() !== '') {
							sendMessage();
						}
					}}
					disabled={newMessage.trim() === ''}
					className={`flex items-center gap-2 p-2 rounded-lg text-xs transition 
						${newMessage.trim() === '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink text-white'}`}
				>
					<BsSend size={16} />
				</button>
			</div>
		</div>
	);
};
