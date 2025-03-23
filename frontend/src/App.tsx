import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { Home } from "./features/home/Home.tsx";
import { Login } from "./features/auth/Login.tsx";
import { Register } from "./features/auth/Register.tsx";
import { UserPhotosSetup } from "./features/onboarding/step1/UserPhotosSetup.tsx";
import { ProfileDefinition } from "./features/onboarding/step2/ProfileDefinition.tsx";
import { SexualOrientationSelector } from "./features/onboarding/step3/SexualOrientationSelector.tsx";
import { UserInterestSelector } from "./features/onboarding/step4/UserInterestSelector.tsx";
import { Profil } from "./features/app/profile/Profil.tsx";
import { Chat } from "./features/app/chat/Chat.tsx";
import { Nearby } from "./features/app/nearby/Nearby.tsx";
import { Layout } from "./features/app/layout/Layout.tsx";
import { Conversation } from "./features/app/chat/Conversation.tsx";
import { AuthRoute, PrivateRoute } from "./PrivateRoute.tsx";
import { UserProfile } from "./features/app/profile/User.tsx";
import { Settings } from "./features/app/settings/Settings.tsx";
import { MainPage } from "./features/app/discover/MainPage.tsx";
import { History } from "./features/app/history/History.tsx";
import { BlockedUsers } from "./features/app/block/BlockedUser.tsx";
import { ReportedUsers } from "./features/app/report/reportedUser.tsx";
import { ResetPassword } from "./features/auth/ResetPassword.tsx";
import { ForgotPassword } from "./features/auth/ForgotPassword.tsx";
import { Events } from "./features/app/events/Events.tsx";

export const App = () => {
	return (
		<Router>
			<Routes>
				<Route element={<AuthRoute />}>
					<Route index element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/reset-password" element={<ResetPassword />} />		
					<Route path="/forgot-password" element={<ForgotPassword />} />		
				</Route>

				<Route element={<PrivateRoute />}>
				{/*<Route element={<OnboardingRoute />}>*/}
					<Route path="/step1" element={<UserPhotosSetup />} />
					<Route path="/step2" element={<ProfileDefinition />} />
					<Route path="/step3" element={<SexualOrientationSelector />}/>
					<Route path="/step4" element={<UserInterestSelector />} />
				{/*</Route>*/}

					<Route path="/" element={<Layout />}>
						<Route path="/home" element={<MainPage />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="/events" element={<Events />} />
						<Route path="/nearby" element={<Nearby />} />
						<Route path="/history" element={<History />} />
						<Route path="/reported" element={<ReportedUsers />} />
						<Route path="/blocked" element={<BlockedUsers />} />
						<Route path="/chat" element={<Chat />} />
						<Route path="/chat/:chatId" element={<Conversation />} />
						<Route path="/profil" element={<Profil />} />
						<Route path="/user/:userId" element={<UserProfile />} />
					</Route>
				</Route>
			</Routes>
		</Router>
	);
};
