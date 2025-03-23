export const useSocialAuth = () => {
	const socialRegisterHandler = (provider: "google" | "facebook" ) => {
	  window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/${provider}`;
	};

	const socialLoginHandler = (provider: "google" | "facebook" ) => {
		window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/${provider}/login`;
	 };
  
	return { socialLoginHandler, socialRegisterHandler };
  };
  