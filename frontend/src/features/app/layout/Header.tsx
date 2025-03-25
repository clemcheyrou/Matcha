import React, { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { useNotification } from './hooks/useNotification.ts';
import { SettingsDropdown } from '../settings/SettingsDropdown.tsx';
import { NotificationPopin } from './NotificationPopin.tsx';
import { FiEdit3 } from "react-icons/fi";
import { setLocation } from '../../../store/slice/locationSlice.ts';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store.ts';

export const Header = () => {
  const { notification, showNotification, handleCloseNotification } = useNotification();  
  const [address, setAddress] = useState('');
  const [showPopin, setShowPopin] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { lat, lng, city } = useSelector((state: RootState) => state.location);

  useEffect(() => {
    if (lat === null || lng === null) {
      const fetchLocationFromBackend = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/locations/user`, {
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("failed to fetch location");
          }

          const data = await response.json();
          const { lat, lng } = data;

          dispatch(setLocation({ lat, lng, city: "" }));

          const cityResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const cityData = await cityResponse.json();
          const newCity = cityData.address.city || cityData.address.town || cityData.address.village || "Unknown";

          dispatch(setLocation({ lat, lng, city: newCity }));
        } catch (error) {
          console.error("error fetching location:", error);
        }
      };

      fetchLocationFromBackend();
    }
  }, [lat, lng, dispatch]);

  const handleAllowLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const newCity = data.address.city || data.address.town || data.address.village || 'Inconnu';

          await fetch(`${process.env.REACT_APP_API_URL}/api/locations`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
            credentials: 'include',
          });

		  dispatch(setLocation({ lat: latitude, lng: longitude, city: newCity }));
        } catch (error) {
          console.error('error sending localisation:', error);
        }
      },
      (error) => console.error('error fetching:', error)
    );
  };

  const handleAddressSubmit = async () => {
    if (!address) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (!data.length)
        return alert('address not find');

      const location = data[0];
      const newCity = location.display_name.split(',')[0] || 'Inconnu';

      await fetch(`${process.env.REACT_APP_API_URL}/api/locations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: location.lat, lng: location.lon }),
        credentials: 'include',
      });

      setAddress('');
	  dispatch(setLocation({ lat: location.lat, lng: location.lon, city: newCity }));
    } catch (error) {
      console.error('error finding localisation:', error);
    }
  };

  return (
    <>
      {showNotification && notification && (
        <div className="absolute top-16 w-64 right-6 bg-bg rounded-lg p-4 z-50 border">
          <div className="flex justify-between items-center text-white text-xs">
            <span>{notification}</span>
            <span className="cursor-pointer text-xl ml-3" onClick={handleCloseNotification}>
              <RxCross2 />
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 mx-6">
        <div>
          <span className="opacity-60 text-sm">Localisation</span>
          <div className="flex items-center space-x-2">
            <FiEdit3
              className="cursor-pointer"
              onClick={() => setShowPopin(true)}
            />
            <span>{city}</span>
          </div>
        </div>
        <div className="flex items-center gap-x-6">
          <NotificationPopin />
          <SettingsDropdown />
        </div>
      </div>

      {showPopin && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-bg p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Change localisation</h3>
              <RxCross2
                className="cursor-pointer text-xl"
                onClick={() => setShowPopin(false)}
              />
            </div>
            <div className="space-y-4">
              <button
                className="w-full bg-pink text-white p-2 rounded"
                onClick={() => {
                  handleAllowLocation();
                  setShowPopin(false);
                }}
              >
                Use my geolocalisation
              </button>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter an address"
                  className="border rounded p-2 text-black w-full"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <button
                  className="bg-pink text-white px-4 py-2 rounded"
                  onClick={() => {
                    handleAddressSubmit();
                    setShowPopin(false);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
