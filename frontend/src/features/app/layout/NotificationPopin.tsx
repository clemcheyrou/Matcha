import React, { useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useNotification } from "./hooks/useNotification.ts";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

export const NotificationPopin = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications ,error, loading, markAsRead, handleResponse } = useNotification();

    return (
        <div className="relative">
            <div
                className="h-8 w-8 rounded text-white flex items-center justify-center cursor-pointer relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <IoMdNotificationsOutline size={20} />
                {notifications.some((n) => !n.is_read) && (
                    <span className="absolute top-0 right-0 rounded-full bg-red-500 text-white text-xs px-1">
                        {notifications.filter((n) => !n.is_read).length}
                    </span>
                )}
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#191919] shadow-lg rounded-lg p-4 z-50 text-black text-normal">
                    <h3 className="text-lg font-semibold border-b pb-2 text-white">Notifications</h3>
                    <div className="max-h-60 overflow-y-auto mt-2">
                        {loading && <p className="text-gray-500">Loading...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`text-sm p-2 border-b last:border-none cursor-pointer text-white ${
                                        notif.is_read && 'opacity-60'
                                    }`}
                                    onClick={() => markAsRead(notif.id)}
                                >
                                    {notif.type === 'event' ? (
                                        <div>
                                            <h2>{notif.message}</h2>
											<div className="flex gap-4">
										      <button
										        onClick={() => handleResponse(notif.id, true)}
										        className="flex items-center text-green-500 hover:text-green-700"
										      >
										        <AiOutlineCheckCircle size={24} className="mr-2" />
										        Accept
										      </button>
										      <button
										        onClick={() => handleResponse(notif.id, false)}
										        className="flex items-center text-red-500 hover:text-red-700"
										      >
										        <AiOutlineCloseCircle size={24} className="mr-2" />
										        Reject
										      </button>
										    </div>
										</div>
                                    ) : (
                                        <div>{notif.message}</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 mt-2">No notifications</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
