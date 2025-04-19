import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { LuEye, LuEyeOff, LuUserRound } from "react-icons/lu";
import { MdOutlineMailOutline } from "react-icons/md";
import { FiLock } from "react-icons/fi";
import { useForm } from "./hooks/useForm.ts";
import { useAuth } from "./hooks/useAuth.ts";
import { useSocialAuth } from "./hooks/useSocialAuth.ts";
import { fetchUser } from "../../store/slice/authSlice.ts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store.ts";
import { HeaderHome } from "../home/header/Header.tsx";

//pas de provider detecte : null / pas token detecter
//http://localhost:3000/undefined/api/auth/register 404 (
export const Register = () => {
	const { formData, errors, isFormValid, handleChange } = useForm();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const [popupMessage, setPopupMessage] = useState("");
	const [searchParams] = useSearchParams();
	const [emailError, setEmailError] = useState(false);
	const [usernameError, setUsernameError] = useState(false);
	const dispatch = useDispatch<AppDispatch>();

	const navigate = useNavigate();
	const { register } = useAuth();
	const { socialRegisterHandler } = useSocialAuth();

    useEffect(() => {
        const urlParams = searchParams.get("provider");

        if (urlParams) {
            const checkAuthentication = async () => {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/status`, {
					method: "GET",
					credentials: "include",
				});
				if (response.ok) {
					const text = await response.text(); // Lire la réponse brute

					const data = JSON.parse(text); // Convertir en JSON si possible
					if (data.authenticated) {
						navigate('/step1');
					} else {

						navigate('/register');
					}
				}
			};
            checkAuthentication();
		}
    }, [navigate, searchParams]);

	useEffect(() => {
		const errorParam = searchParams.get("error");
		if (errorParam === "email_exists") {
			setEmailError(true);
		} 
		else if (errorParam === "username_exists") {
			setUsernameError(true);
		} else {
			setEmailError(false);
			setUsernameError(false);
		}
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const response = await register(formData);
			if (response.success) {
				setPopupMessage("email confirmation have been send");
				setIsPopupVisible(true);
				setEmailError(false);
			} else if (response.message === "email_exists") {
				setEmailError(true);
			}
			else if (response.message === "username_exists") {
				setUsernameError(true);
			}
		} catch (error) {
			console.error("Erreur lors de l'inscription :", error);
			console.error("error during registration:", error);
			setPopupMessage("error try again");
			setIsPopupVisible(true);
		}
	};

	useEffect(() => {
		const token = searchParams.get("token");
		if (token) {
			const confirmEmail = async () => {
				try {
					const response = await fetch(
						`${process.env.REACT_APP_API_URL}/api/auth/confirm-email?token=${token}`,
						{
							method: "GET",
							credentials: "include",
						}
					);
					const data = await response.json();
					if (data.success) {
						await dispatch(fetchUser());
						navigate("/step1");
					} else {
						throw new Error("error to confirm");
					}
				} catch (error) {
					console.error("error:",error);
				}
			};

			confirmEmail();
		}
	}, [searchParams, navigate, dispatch]);

	const Popup = ({ message, onClose }) => {
		return (
			<div className="fixed inset-0 flex items-center justify-center z-50">
				<div
					className="bg-black bg-opacity-75 w-full h-full absolute text-black"
					onClick={onClose}
				></div>
				<div className="bg-white rounded-lg p-6 relative z-10">
					<p className="text-black">{message}</p>
					<button
						className="mt-4 bg-pink rounded px-4 py-2"
						onClick={onClose}
					>
						Close
					</button>
				</div>
			</div>
		);
	};

	return (
		<div className="mb-16 h-screen w-screen text-white px-6 md:px-28 lg:px-96">
			<HeaderHome />
			<div className="flex flex-col items-center justify-center mt-28">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">
						Create an account
					</h1>
					<h2 className="text-xl text-gray-300">
						Enter your details to register
					</h2>
				</div>

				<form
					className="space-y-4 w-full max-w-sm"
					onSubmit={handleSubmit}
				>
					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<LuUserRound className="text-gray-500" />
						</div>
						<input
							type="text"
							name="username"
							placeholder="Username"
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
							value={formData.username}
							onChange={handleChange}
						/>
					</div>
					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<LuUserRound className="text-gray-500" />
						</div>
						<input
							type="text"
							name="firstname"
							placeholder="Firstname"
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
							value={formData.firstname}
							onChange={handleChange}
						/>
					</div>
					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<LuUserRound className="text-gray-500" />
						</div>
						<input
							type="text"
							name="lastname"
							placeholder="Lastname"
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
							value={formData.lastname}
							onChange={handleChange}
						/>
					</div>

					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<MdOutlineMailOutline className="text-gray-500" />
						</div>
						<input
							type="email"
							name="email"
							placeholder="Email"
							className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>
						{errors.email && (
							<p className="text-red-500 text-sm">
								{errors.email}
							</p>
						)}

					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<FiLock className="text-gray-500" />
						</div>
						<input
							type={showPassword ? "text" : "password"}
							id="password"
							name="password"
							placeholder="Password"
							className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
							value={formData.password}
							onChange={handleChange}
						/>
						<div
							className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<LuEye className="text-gray-500" />
							) : (
								<LuEyeOff className="text-gray-500" />
							)}
						</div>
					</div>
					{errors.password && (
						<p className="text-red-500 text-sm">
							{errors.password}
						</p>
					)}

					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<FiLock className="text-gray-500" />
						</div>
						<input
							type={showConfirmPassword ? "text" : "password"}
							id="confirm-password"
							name="confirmPassword"
							placeholder="Confirm password"
							className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
							value={formData.confirmPassword}
							onChange={handleChange}
						/>
						<div
							className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
							onClick={() =>
								setShowConfirmPassword(!showConfirmPassword)
							}
						>
							{showConfirmPassword ? (
								<LuEye className="text-gray-500" />
							) : (
								<LuEyeOff className="text-gray-500" />
							)}
						</div>
					</div>

					<button
						type="submit"
						className={`w-full text-center font-agbalumo text-black rounded-md px-4 py-2 mt-6 ${
							isFormValid
								? "bg-pink text-white hover:bg-white hover:text-pink-500"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
						}`}
						disabled={!isFormValid}
					>
						NEXT
					</button>
				</form>

				{emailError && (
					<p className="text-red-500 text-sm">
						This email is already in use. Try another or{" "}
						<Link
							to="/login"
							className="text-pink-500 font-bold hover:underline"
						>
							connect
						</Link>
						.
					</p>
				)}
				{usernameError && (
					<p className="text-red-500 text-sm">
						This username is already in use. Try another or{" "}
						<Link
							to="/login"
							className="text-pink-500 font-bold hover:underline"
						>
							connect
						</Link>
						.
					</p>
				)}

				<div className="mt-6">
					<p className="text-center">Or login with</p>
					<div className="flex space-x-4 mt-6">
						<div
							className="flex items-center justify-center w-32 h-10 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-300"
							onClick={() => socialRegisterHandler("google")}
						>
							<FaGoogle className="mr-2" /> Google
						</div>

						<div
							className="flex items-center justify-center w-32 h-10 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-300"
							onClick={() => socialRegisterHandler("facebook")}
						>
							<FaFacebook className="mr-2" /> Facebook
						</div>
					</div>
					<p className="text-center">
						Do you already have an account?{" "}
						<Link to="/login">
							<span className="text-pink font-bold cursor-pointer hover:underline">
								Login
							</span>
						</Link>
					</p>
				</div>

				{isPopupVisible && (
					<Popup
						message={popupMessage}
						onClose={() => setIsPopupVisible(false)}
					/>
				)}
			</div>
		</div>
	);
};
