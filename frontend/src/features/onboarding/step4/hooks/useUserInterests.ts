import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from '../../../../store/store';
import { fetchUser } from '../../../../store/slice/authSlice.ts';

export const useUserInterests = () => {
	const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();

	const toggleInterest = (interest: string) => {
		setSelectedInterests((prev) =>
			prev.includes(interest)
				? prev.filter((i) => i !== interest)
				: [...prev, interest]
		);
	};

	const isNextDisabled = selectedInterests.length === 0;

	const handleSubmit = async (e: FormEvent) => {
		if (isNextDisabled) {
			e.preventDefault();
			return;
		}

		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/api/users/save-interests`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ interests: selectedInterests }),
					credentials: "include",
				}
			);

			if (response.ok) {
				await dispatch(fetchUser());
				navigate("/home");
			} else {
				console.error("error");
			}
		} catch (error) {
			console.error("error servor", error);
		}
	};

	return {
		selectedInterests,
		toggleInterest,
		handleSubmit,
		isNextDisabled,
	};
};
