import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "../../../../store/slice/authSlice.ts";
import { AppDispatch } from "../../../../store/store.ts";
import { setLocation } from "../../../../store/slice/locationSlice.ts";

export const useLocationPopup = () => {
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, { credentials: "include" })
          if (!response.ok) throw new Error("failed to fetch profile")
          const user = await response.json()
          console.log(user.location)
          if (!user.location)
            setShowLocationPopup(true);
        } catch (err: any) {
          console.log('error')};
        };
      fetchUserData()
    }, [])

  const handleAllowLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/locations`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lat: latitude,
              lng: longitude,
            }),
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("failed to create location");
          }

          const data = await response.json();
          console.log('new location:', data);
          await dispatch(fetchUser());
          dispatch(setLocation({ lat: latitude, lng: longitude }));
        } catch (error) {
          console.error("error sending location:", error);
        } finally {
          setShowLocationPopup(false);
        }
      },
      (error) => {
        console.error("error getting location:", error);
        setShowLocationPopup(false);
      }
    );
  };

  const handleClosePopup = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: 48.8566,
          lng: 2.3522,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("failed to create location");
      }

      const data = await response.json();
      console.log('new location:', data);
      await dispatch(fetchUser());
      dispatch(setLocation({ lat: 48.8566, lng: 2.3522 }));
    } catch (error) {
      console.error("error sending location:", error);
    } finally {
      setShowLocationPopup(false);
    }
  };

  return {
    showLocationPopup,
    handleAllowLocation,
    handleClosePopup,
  };
};
