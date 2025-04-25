import { useState, useEffect, useCallback } from "react";

export const useForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = useCallback(() => {
    const { username, firstname, lastname, email, password, confirmPassword } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValid =
      username.trim().length > 0 &&
      firstname.trim().length > 0 &&
      lastname.trim().length > 0 &&
      emailRegex.test(email) &&
      password.length >= 8 &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSpecialChar &&
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
    if (name === "username" && value.trim().length === 0) {
      errorMessage = "Username is required";
    }
    if (name === "firstname" && value.trim().length === 0) {
      errorMessage = "Firstname is required";
    }
    if (name === "lastname" && value.trim().length === 0) {
      errorMessage = "Lastname is required";
    }
    if (name === "password" && 
      (value.length < 8 || 
      !/[A-Z]/.test(value) || 
      !/[a-z]/.test(value) ||
      !/\d/.test(value) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(value)
  )) {
      errorMessage = "Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one digit, and one special character.";
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
