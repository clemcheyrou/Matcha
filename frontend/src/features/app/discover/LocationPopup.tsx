import React from 'react';
import { FiMapPin } from "react-icons/fi";

interface LocationPopupProps {
    onClose: () => void;
    onAllow: () => void;
}

export const LocationPopup: React.FC<LocationPopupProps> = ({ onClose, onAllow }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#191919] rounded-lg p-4 shadow-lg text-center w-18">
				<FiMapPin className='m-auto my-2' size={60}/>
                <h2 className="text-2xl font-semibold font-agbalumo mb-4 mt-0 opacity-100">Allow Location Access</h2>
                <p className="mb-4 opacity-60">We would like to access your location to provide better matches.</p>
                <div className="flex w-1/2 justify-between m-auto mt-6 mb-4">
                    <button
                        onClick={onAllow}
                        className="bg-green-500 text-white px-3 py-1 rounded font-agbalumo"
                    >
                        Allow
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-3 py-1 rounded font-agbalumo"
                    >
                        Deny
                    </button>
                </div>
            </div>
        </div>
    );
};
