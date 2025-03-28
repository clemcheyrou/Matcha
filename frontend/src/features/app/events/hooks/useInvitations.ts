import { useEffect, useState } from "react";
import { Invitation } from "../type/type";

export const useInvitations = () => {
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [error, setError] = useState<string | null>(null);
  
	useEffect(() => {
	  const fetchInvitations = async () => {
		try {
		  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/invitations`, { credentials: "include" });
		  if (!response.ok) throw new Error("failed to fetch invitations.");
		  const data = await response.json();
		  setInvitations(data);
		} catch (err) {
		  setError("error fetching invitations.");
		}
	  };
  
	  fetchInvitations();
	}, []);
  
	return { invitations, error, setInvitations };
  };