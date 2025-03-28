import { useEffect, useState } from "react";
import { Event } from "../type/type";

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
	const fetchEvents = async () => {
	  try {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/api/events/user`, { credentials: "include" });
		if (!response.ok) throw new Error("failed to fetch events.");
		const data = await response.json();
		setEvents(data);
	  } catch (err) {
		setError("error fetching events.");
	  } finally {
		setLoading(false);
	  }
	};

	fetchEvents();
  }, []);

  return { events, loading, error };
};

