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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, { credentials: "include" });
        if (!response.ok) throw new Error("failed to fetch profile");
        const user = await response.json();
        if (!user.location) setShowLocationPopup(true);
      } catch (err: any) {
        console.log('error');
      }
    };
    fetchUserData();
  }, []);

  const handleAllowLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const geocodeData = await geocodeResponse.json();
          const city = geocodeData.address.city || geocodeData.address.town || geocodeData.address.village || 'Unknown';

          const locationResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/locations`, {
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
          if (!locationResponse.ok) {
            throw new Error("failed to create location");
          }

          await locationResponse.json();
          await dispatch(fetchUser());
          dispatch(setLocation({ lat: latitude, lng: longitude, city: city }));
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
      const defaultLat = 48.8566;
      const defaultLng = 2.3522;

      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${defaultLat}&lon=${defaultLng}`
      );
      const geocodeData = await geocodeResponse.json();
      const defaultCity = geocodeData.address.city || geocodeData.address.town || geocodeData.address.village || 'Paris';

      const locationResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: defaultLat,
          lng: defaultLng,
        }),
        credentials: "include",
      });
      console.log('ok')
      if (!locationResponse.ok) {
        throw new Error("failed to create location");
      }

      await locationResponse.json();
      await dispatch(fetchUser());
      dispatch(setLocation({ lat: defaultLat, lng: defaultLng, city: defaultCity }));
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
