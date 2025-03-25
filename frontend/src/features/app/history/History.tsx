import React, { useEffect, useState } from 'react'
import { View } from '../type/type';

export const History = () => {
    const [views, setViews] = useState<View[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileViews = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/views`, {
                    credentials: 'include',
                });

                if (!response.ok)
                    throw new Error('error to get viewed users');

                const data = await response.json();
                setViews(data.views);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileViews();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="mt-10 mx-6">
			<h1 className="text-3xl mb-10">Profile Views</h1>
            {views.length === 0 || error ? (
                <p>No one has viewed your profile yet.</p>
            ) : (
                <ul>
                    {views.map(view => (
                        <li key={view.id}>
                            <strong>{view.viewer_name}</strong> viewed your profile on{' '}
                            {new Date(view.created_at).toLocaleString()}.
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
