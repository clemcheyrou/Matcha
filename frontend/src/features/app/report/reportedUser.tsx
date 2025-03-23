import React, { useEffect, useState } from "react";
import { User } from "../type/type";
import socket from "../../../service/socket";

export const ReportedUsers = () => {
	const [reportedUsers, setReportedUsers] = useState<User[]>([]);

	useEffect(() => {
		const fetchReportedUsers = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reported`, { credentials: "include" });
				if (!response.ok) throw new Error("error to reported users");
				setReportedUsers(await response.json());
			} catch (error) {
				console.error(error);
			}
		};

		fetchReportedUsers();

		const handleUnreport = (id: number) => {
			setReportedUsers((prev) => prev.filter(user => user.id !== id));
		};
	
		socket.on("unreported", handleUnreport);
	
		return () => {
			socket.off("unreported", handleUnreport);
		};
	}, []);

	const toggleBlock = (id: number) => socket.emit("unreport", id);

	return (
		<div className="mt-10 mx-6">
			<h1 className="text-3xl mb-10">Reported Users</h1>
			{reportedUsers.length === 0 ? (
				<p>No reported users.</p>
			) : (
				<ul className="grid grid-cols-3 gap-4">
					{reportedUsers.map(({ id, name, profile_photo }) => (
						<li key={id} className="flex flex-col items-center rounded-lg">
							<img src={`${process.env.REACT_APP_API_URL}${profile_photo}`} alt={name} className="w-40 h-40 object-cover rounded-md" />
							<div className="flex items-center justify-between gap-x-6 mt-4">
								<span className="font-semibold">{name}</span>
								<button onClick={() => toggleBlock(id)} className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
									Unreport
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
