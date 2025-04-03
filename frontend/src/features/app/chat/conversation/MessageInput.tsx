import React, { useEffect, useRef, useState } from "react";
import socket from "../../../../service/socket";
import { AiOutlineAudio } from "react-icons/ai";
import { BsSend } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { EventPlanning } from "./EventPlanning.tsx";

interface MessageInput {
	newMessage: string;
	setNewMessage: (message: string) => void;
	sendMessage: () => void;
	sendAudio: () => void;
	setNewAudio: (audio: string) => void;
}

export const MessageInput: React.FC<MessageInput> = ({
	newMessage,
	setNewMessage,
	sendMessage,
	sendAudio,
	setNewAudio
}) => {
	const [isRecording, setIsRecording] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
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
			const audioUrl = URL.createObjectURL(audioBlob);
			setNewAudio(audioUrl);
			sendAudio();
			socket.emit("audio-message", {
				chat_id: Number(chatId),
				audio: audioBlob,
			});
		};

		mediaRecorderRef.current.start();
		setIsRecording(true);
	};

	const stopRecording = () => {
		mediaRecorderRef.current?.stop();
		setIsRecording(false);
	};

	useEffect(() => {
		socket.on("audio-message", (audioData: Blob) => {
			const audioUrl = URL.createObjectURL(audioData);
			if (audioRef.current) {
				audioRef.current.src = audioUrl;
			}
		});

		return () => {
			socket.off("audio-message");
		};
	}, []);

	return (
		<div className="pt-2 pb-6">
			<div className="flex items-center gap-4">
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Type a message..."
					className="flex-1 bg-bg rounded-lg px-4 py-2 outline-none text-white text-sm"
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
					onClick={sendMessage}
					className="flex items-center gap-2 p-2 bg-pink text-white rounded-lg text-xs"
				>
					<BsSend size={16} />
				</button>
			</div>
		</div>
	);
};
