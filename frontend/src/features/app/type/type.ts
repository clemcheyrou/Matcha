export type User = {
	bio?: string;
	id: number;
	name?: string;
	age?: number;
	profile_photo: string;
	gender?: string;
	orientation?: number;
	liked_by_user: boolean;
	is_connected?: boolean;
	location?: boolean;
	liked_by_other?: boolean;
	blocked_by_user: boolean;
	interests?: string[];
	reported_by_user: boolean;
	distance_km: number;
	photos: string[];
	fame_count: number;
};

export type View = {
    id: number;
    viewer_name: string;
    created_at: string;
};

export interface AudioProps {
	audioUrl: string | null;
}