import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User } from '../../type/type';
import socket from '../../../../service/socket';
import { RootState } from '../../../../store/store';

interface Filters {
    age: [number, number];
    location: [number, number];
    fame: [number, number];
    tags: string[];
}

const prepareQueryParams = (filters: Filters | undefined): string => {
    if (!filters) {
        return '';
    }

    const { age, location, fame, tags } = filters;
    const params = new URLSearchParams();

    if (age && age.length === 2) {
        params.append('ageMin', age[0].toString());
        params.append('ageMax', age[1].toString());
    }

    if (location && location.length === 2) {
        params.append('locationMin', location[0].toString());
        params.append('locationMax', location[1].toString());
    }

    if (fame && fame.length === 2) {
        params.append('fameMin', fame[0].toString());
        params.append('fameMax', fame[1].toString());
    }

    if (tags && tags.length > 0) {
        params.append('tags', tags.join(','));
    }

    return params.toString();
};

export const useDiscoverNewUsers = () => {
    const filters = useSelector((state: RootState) => state.filters);
    const sortBy = useSelector((state: RootState) => state.sort);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const location = useSelector((state: RootState) => state.location);

    useEffect(() => {
        if (!filters) {
            setError('Filters are undefined');
            setLoading(false);
            return;
        }

        const queryParams = prepareQueryParams(filters);

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/match/discover?sortBy=${sortBy}&${queryParams}`,
                    { credentials: 'include' }
                );
                if (!response.ok) {
                    throw new Error('cannot fetch users');
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();

        const removeUserFromDiscovery = (matchedUserId: User) => {
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== matchedUserId.id));
        };

        const addUserFromDiscovery = (unmatchedUser: User) => {
            setUsers((prevUsers) => [...prevUsers, unmatchedUser]);
        };

        const handleUserLike = (like: number) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === like ? { ...user, liked_by_user: true, fame_rating: user.fame_rating }: user
                )
            );
        };

        const handleUserUnlike = (like: number) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === like ? { ...user, liked_by_user: false, fame_rating: user.fame_rating }: user
                )
            );
        };

        const handleReceivelike = (like: number) => {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === like ? { ...user, liked_by_other: !user.liked_by_other } : user
                )
            );
        }

        socket.on('match', removeUserFromDiscovery);
        socket.on('unmatch', addUserFromDiscovery);
        socket.on('like', handleUserLike);
        socket.on('unlike', handleUserUnlike);
        socket.on('receiveLike', handleReceivelike);
        socket.on('receiveUnLike', handleReceivelike);

        return () => {
            socket.off('match', removeUserFromDiscovery);
            socket.off('unmatch', addUserFromDiscovery);
            socket.off('like', handleUserLike);
            socket.off('unlike', handleUserUnlike);
            socket.off('receiveLike', handleReceivelike);
            socket.off('receiveUnLike', handleReceivelike);
        };
    }, [filters, sortBy, location.isLocationSet]);
    console.log(users);
    return { users, loading, error };
};
