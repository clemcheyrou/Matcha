import { useEffect, useState } from 'react';

interface UserLocation {
    id: number;
    username: string;
    lat: number;
    lng: number;
    isCurrentUser?: boolean;
}

export const useUserLocations = () => {
    const [locations, setLocations] = useState<UserLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserLocations = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/locations`, {credentials: 'include'});
                if (!response.ok) {
                    throw new Error('error find users location');
                }
                const data = await response.json();
                setLocations(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserLocations();
    }, []);
    console.log(locations)
    return { locations, loading, error };
};
