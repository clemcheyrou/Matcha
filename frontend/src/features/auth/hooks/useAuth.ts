import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUser, loginUser, registerUser } from "../../../store/slice/authSlice.ts";
import { AppDispatch, RootState } from "../../../store/store";

export const useAuth = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const { user, error } = useSelector((state: RootState) => state.auth);

	const register = async (formData: {
		username: string;
		firstname: string;
		lastname: string;
		email: string;
		password: string;
	}) => {
		try {
			const response = await dispatch(
				registerUser({
					username: formData.username,
					firstname: formData.firstname,
					lastname: formData.lastname, 
					email: formData.email,
					password: formData.password,
				})
			).unwrap();
			return response;
		} catch (err) {
			console.error("error registering user:", err);
			return { success: false, message: err };
		}
	};

	const login = async (formData: {
		username: string;
		password: string;
	}) => {
		try {
			const response = await dispatch(
				loginUser({
					username: formData.username,
					password: formData.password,
				})
			).unwrap();
			return response;
		} catch (err) {
			console.error("error login user:", err);
			return { success: false, message: err };
		}
	};

	useEffect(() => {
		const fetchUserData = async () => {
			const provider = new URLSearchParams(window.location.search).get(
				"provider"
			);
			if (provider) {
				try {
					await dispatch(fetchUser());
					navigate("/step1");
				} catch (error) {
					console.error("error fetching user data:", error);
				}
			}
		};

		fetchUserData();
	}, [dispatch, navigate]);

	return { user, error, register, login };
};
