import { getNotifications, markAsRead } from "../models/notificationModel.js";

export const getNotificationsController = async (req, res) => {
	const currentUserId = req.session.userId;

	if (!currentUserId)
		return res.status(401).json({ message: "user not authenticated" });

	try {
		const notifications = await getNotifications(currentUserId);
		res.status(200).json({ success: true, notifications });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "error to get notification",
		});
	}
};

export const markAsReadController = async (req, res) => {
    const { notificationId } = req.params;
    const currentUserId = req.session.userId;

    if (!currentUserId) {
        return res.status(401).json({ message: "user not authenticated" });
    }

    try {
        const updatedNotification = await markAsRead(notificationId);
        if (!updatedNotification) {
            return res.status(404).json({ message: "notification not found" });
        }

        res.status(200).json({
            success: true,
            notification: updatedNotification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error updating notification",
        });
    }
};