import React, { useState, useEffect } from 'react';

export type Event = {
	id: number;
	title: string;
	description: string;
	date: string;
	location?: string;
	popularity?: number;
};
  
export const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/events`, { credentials: 'include' });
        if (!response.ok) {
          throw new Error('failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>No events find at this time</p>;

  return (
	<div className="mt-10 mx-6">
      <h2 className='text-white'>Your Events</h2>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>{event.date}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};