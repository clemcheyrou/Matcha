import { useState, useEffect, ReactNode } from "react";
import socket from "../../../../service/socket";

export type Notification = {
	eventDate: string | number | Date;
	eventTitle: ReactNode;
	id: number;
	type: "message" | "like" | "unlike" | "view" | "match" | "event";
	sender_id?: number;
	message: string;
	is_read: boolean;
	created_at: Date;
};

export const useNotification = () => {
	const [notification, setNotification] = useState<string | null>(null);
	const [showNotification, setShowNotification] = useState<boolean>(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>();

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_URL}/api/notification`,
					{ credentials: "include" }
				);
				if (!response.ok) throw new Error("error");
				const data = await response.json();
				setNotifications(data.notifications);
			} catch (err) {
				setError("error notifications");
			} finally {
				setLoading(false);
			}
		};

		fetchNotifications();

		const handleNotification = (newNotification: Notification) => {
			setNotifications((prevNotifications) => [
				newNotification,
				...prevNotifications,
			]);
			setNotification(newNotification.message);
			setShowNotification(true);

			setTimeout(() => {
				setShowNotification(false);
			}, 5000);
		};

		socket.on("notification", handleNotification);

		return () => {
			socket.off("notification", handleNotification);
		};
	}, []);

	const markAsRead = async (notificationId: any) => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/notification/${notificationId}/read`,
				{
					method: "PATCH",
					credentials: "include",
				}
			);

			if (!response.ok) throw new Error("error marking as read");

			setNotifications((prevNotifications) =>
				prevNotifications.map((notif) =>
					notif.id === notificationId
						? { ...notif, is_read: true }
						: notif
				)
			);
		} catch (err) {
			console.error("error notification", err);
		}
	};

	const handleResponse = (invitationId, accepted) => {
		socket.emit("invitation-response", {
			invitationId,
			accepted: accepted,
			userId: "current_user_id",
		});
	};

	const handleCloseNotification = () => {
		setShowNotification(false);
	};

	return {
		notification,
		showNotification,
		handleCloseNotification,
		notifications,
		error,
		loading,
		markAsRead,
		handleResponse,
	};
};
