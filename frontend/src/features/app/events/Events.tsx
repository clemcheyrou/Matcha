import React from "react";
import socket from "../../../service/socket";
import { Invitation } from "./type/type.ts";
import { useEvents } from "./hooks/useEvents.ts";
import { useInvitations } from "./hooks/useInvitations.ts";
import { formatDate } from "../../utils/Date.ts";

export const Events = () => {
	const { events, loading, error: eventsError } = useEvents();
	const { invitations, setInvitations } = useInvitations();

	const handleResponse = (
		invitationId: string,
		accepted: boolean,
		invitations: Invitation[],
		setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>>
	) => {
		socket.emit("invitation-response", { invitationId, accepted });

		setInvitations(
			invitations.filter((invitation) => invitation.id !== invitationId)
		);
	};

	if (loading) return <p>Loading events...</p>;

	return (
		<div className="mt-10 mx-6">
			<h1 className="text-3xl mb-10">Your Events</h1>

			<h2 className="text-xl">Invitations</h2>
			{invitations.length > 0 ? (
				<ul className="space-y-3 mt-4 overflow-auto h-max-[200px]">
					{invitations.map((invitation, id) => (
						<li
							key={id}
							className="flex items-center justify-between p-3 bg-bg rounded-lg"
						>
							<span className="text-white text-sm">
								{invitation.title} {formatDate(invitation.date)}{" "}
								{invitation.heure}
							</span>
							<div className="flex space-x-2 flex-nowrap">
								<button
									onClick={() =>
										handleResponse(
											invitation.id,
											true,
											invitations,
											setInvitations
										)
									}
									className="px-4 py-2 bg-green-500 text-white text-xs font-agbalumo rounded-lg hover:bg-green-600 transition flex-grow-0 flex-shrink-0"
								>
									Accept
								</button>
								<button
									onClick={() =>
										handleResponse(
											invitation.id,
											false,
											invitations,
											setInvitations
										)
									}
									className="px-4 py-2 bg-red-500 text-white text-xs font-agbalumo rounded-lg hover:bg-red-600 transition flex-grow-0 flex-shrink-0"
								>
									Refuse
								</button>
							</div>
						</li>
					))}
				</ul>
			) : (
				<p className="text-gray-500">No invitations pending.</p>
			)}

			<h2 className="text-xl mt-10">Your Schedule</h2>
			{eventsError || events.length === 0 ? (
				<p>{eventsError || "No events found."}</p>
			) : (
				<ul className="overflow-auto h-[400px]">
					{events.map((event, id) => (
						<li
							key={id}
							className="mb-4 p-4 bg-bg rounded-lg flex flex-col"
						>
							<div className="mt-2 flex justify-between items-center">
								<div>
									<p className="mt-0">{event.title}</p>
									<p className="mt-0">{formatDate(event.date)} {event.heure}</p>
								</div>
								<span
									className={`px-3 py-1 text-white rounded-md text-xs ${
										event.invitation_status === "accepted"
											? "bg-green-500"
											: event.invitation_status ===
											  "rejected"
											? "bg-red-500"
											: "bg-yellow-500"
									}`}
								>
									{event.invitation_status}
								</span>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
