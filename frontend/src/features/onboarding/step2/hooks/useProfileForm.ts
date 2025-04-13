import { useState } from "react";
import { useNavigate } from "react-router-dom";

const sanitizeInput = (input: string) => {
  return input
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .trim();
};

export const useProfileForm = () => {
  const [selected, setSelected] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(event.target.value);
    setAge(sanitized);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(event.target.value);
    setBio(sanitized);
  };

  const handleSubmit = async () => {
    if (selected && bio && age) {
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        setMessage("please enter a valid age.");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/save-gender-bio`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gender: sanitizeInput(selected),
              bio: sanitizeInput(bio),
              age: parsedAge,
            }),
            credentials: "include",
          }
        );

        if (response.ok) {
          navigate("/step3");
        } else {
          setMessage("incorrect data");
        }
      } catch (error) {
        setMessage("server error");
      }
    } else {
      setMessage("please fill in all fields.");
    }
  };

  return {
    selected,
    setSelected,
    bio,
    age,
    message,
    handleAgeChange,
    handleChange,
    handleSubmit,
  };
};
