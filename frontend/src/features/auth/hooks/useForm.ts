import { useState, useEffect, useCallback } from "react";

export const useForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = useCallback(() => {
    const { username, email, password, confirmPassword } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid =
      username.trim().length > 0 &&
      emailRegex.test(email) &&
      password.length >= 6 &&
      password === confirmPassword;

    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  const validateField = (name: string, value: string) => {
    let errorMessage = "";

    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = "Invalid email address";
      }
    }

    if (name === "password" && value.length < 6) {
      errorMessage = "password must be at least 6 characters";
    }

    if (name === "confirmPassword" && value !== formData.password) {
      errorMessage = "passwords do not match";
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    validateField(name, value);
  };

  return { formData, errors, isFormValid, handleChange };
};
