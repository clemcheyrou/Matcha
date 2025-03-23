import React, { useEffect, useState } from "react";
import { User } from "../type/type";
import socket from "../../../service/socket";

export const BlockedUsers = () => {
	const [blockedUsers, setBlockedUsers] = useState<User[]>([]);

	useEffect(() => {
		const fetchBlockedUsers = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blocked`, { credentials: "include" });
				if (!response.ok) throw new Error("error to blocked users");
				setBlockedUsers(await response.json());
			} catch (error) {
				console.error(error);
			}
		};

		fetchBlockedUsers();

		const handleUnblock = (id: number) => {
			setBlockedUsers((prev) => prev.filter(user => user.id !== id));
		};
	
		socket.on("unblocked", handleUnblock);
	
		return () => {
			socket.off("unblocked", handleUnblock);
		};
	}, []);

	const toggleBlock = (id: number) => socket.emit("unblock", id);

	return (
		<div className="mt-10 mx-6">
			<h1 className="text-3xl mb-10">Blocked Users</h1>
			{blockedUsers.length === 0 ? (
				<p>No blocked users.</p>
			) : (
				<ul className="grid grid-cols-3 gap-4">
					{blockedUsers.map(({ id, name, profile_photo }) => (
						<li key={id} className="flex flex-col items-center rounded-lg">
							<img src={`${process.env.REACT_APP_API_URL}${profile_photo}`} alt={name} className="w-40 h-40 object-cover rounded-md" />
							<div className="flex items-center justify-between gap-x-6 mt-4">
								<span className="font-semibold">{name}</span>
								<button onClick={() => toggleBlock(id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
									Unblock
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
