import React, { useState } from "react";
import { Header } from "../header/Header.tsx";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { LuEye, LuEyeOff, LuUserRound } from "react-icons/lu";
import { FiLock } from "react-icons/fi";
import { useForm } from "./hooks/useForm.ts";
import { useAuth } from "./hooks/useAuth.ts";
import { fetchUser } from "../../store/slice/authSlice.ts";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store.ts";
import { useSocialAuth } from "./hooks/useSocialAuth.ts";

export const Login = () => {
	const [showPassword, setShowPassword] = useState(false);
	const { formData, handleChange } = useForm();
	const { login } = useAuth();
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const { socialLoginHandler } = useSocialAuth();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const result = await login(formData);

		if (result.success) {
			await dispatch(fetchUser());
			navigate("/home");
		} else {
			console.error(result.message);
		}
	};

	return (
		<div className="mb-16 h-screen w-screen text-white px-6 md:px-28 lg:px-96">
			<Header />
			<div className="flex flex-col items-center justify-center mt-40">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">Login</h1>
					<h2 className="text-xl text-gray-300">
						Enter your username and password to login
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
							id="email"
							name="email"
							placeholder="Email"
							value={formData.email}
							onChange={handleChange}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
						/>
					</div>

					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<FiLock className="text-gray-500" />
						</div>
						<input
							type={showPassword ? "text" : "password"}
							id="password"
							name="password"
							placeholder="Password"
							value={formData.password}
							onChange={handleChange}
							className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
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

					<button
						type="submit"
						className="w-full text-center space-x-4 font-agbalumo text-black rounded-md px-4 py-2 mt-6 bg-pink text-white cursor-pointer hover:bg-white hover:text-pink-500"
						>
						CONNECT
					</button>
					<Link to={"/forgot-password"}><p className="cursor-pointer hover:underline text-right">Forgot your password?</p></Link>
				</form>

				<div className="mt-6">
					<p className="text-center">Or login with</p>
					<div className="flex space-x-4 mt-6">
						<div
							className="flex items-center justify-center w-32 h-10 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-300"
							onClick={() => socialLoginHandler("google")}
						>
							<FaGoogle className="mr-2" /> Google
						</div>

						<div
							className="flex items-center justify-center w-32 h-10 bg-gray-500 text-white rounded-lg cursor-pointer hover:bg-gray-300"
							onClick={() => socialLoginHandler("facebook")}
						>
							<FaFacebook className="mr-2" /> Facebook
						</div>
					</div>

					<p className="text-center">
						Don't have an account?{" "}
						<Link to="/register">
							<span className="text-pink font-bold cursor-pointer hover:underline">
								Register
							</span>
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};
