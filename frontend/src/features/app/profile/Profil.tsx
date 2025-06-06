import React, { useEffect, useState } from "react"
import type { User } from "../type/type"
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri"

export const Profil = () => {
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, { credentials: "include" })
        if (!response.ok) throw new Error("failed to load profile")
        const data = await response.json()
        setUserData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handlePhotoChange = (index: number) => {
    setCurrentPhotoIndex(index)
  }

  const nextPhoto = () => {
    if (userData) {
      setCurrentPhotoIndex((prev) => (prev === userData.photos.length - 1 ? 0 : prev + 1))
    }
  }

  const prevPhoto = () => {
    if (userData) {
      setCurrentPhotoIndex((prev) => (prev === 0 ? userData.photos.length - 1 : prev - 1))
    }
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <div className="text-red-600 mb-2 text-xl font-semibold">Error</div>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mt-10 px-6 sm:px-0">
      {loading ? (
        <div>loading...</div>
      ) : userData ? (
        <div className="rounded-lg overflow-hidden shadow-lg border-none">
          <div className="relative w-full h-[320px]">
            <div
              className="absolute top-0 left-0 w-full h-full bg-cover bg-center transition-all duration-500"
              style={{
                backgroundImage: `url(${process.env.REACT_APP_API_URL}${userData.photos[currentPhotoIndex]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button
                className="rounded-full bg-black/30 text-white hover:bg-black/50 p-2 transition-colors"
                onClick={prevPhoto}
              >
                <RiArrowDropLeftLine className="h-6 w-6" />
              </button>
              <button
                className="rounded-full bg-black/30 text-white hover:bg-black/50 p-2 transition-colors"
                onClick={nextPhoto}
              >
                <RiArrowDropRightLine className="h-6 w-6" />
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {userData.photos.map((_, index) => (
                <div
                  key={index}
                  onClick={() => handlePhotoChange(index)}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentPhotoIndex ? "bg-white w-12" : "bg-white/50 w-6"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-2">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-bold font-agbalumo">{userData.username && userData.username.length > 15 ? userData.username.slice(0, 15) + '...' : userData.username}</h2>
                <p className="text-xs text-gray-500 mt-0">{userData.firstname} {userData.lastname} <span className="text-white">({userData.gender} {userData.orientation === 0 ? 'Heterosexual' : userData.orientation === 1 ? 'Homosexual' : 'Bisexual'})</span></p>
                <p className="text-lg text-gray-500">{userData.age} years</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium">🔥 {userData.fame_rating}</span>
              </div>
            </div>

            {userData.interests && userData.interests.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {userData.interests.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm capitalize">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">About me</h3>
              <p className="text-sm">{userData.bio}</p>
            </div>

          </div>
        </div>
      ) : (
        <div className="text-center p-6">User not found</div>
      )}
    </div>
  )
}