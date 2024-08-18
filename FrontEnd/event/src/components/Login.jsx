import { useState } from "react";
import axios from "axios";
import { toast, Slide } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:9090/api/auth/login",
        formData
      );
      localStorage.setItem("token", response.data.token);
      toast.success('You have successfully logged in!', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
        onClose: () => {
          window.location.href = "/events";
        }
        });
    } catch (err) {
      console.error(err);
      alert("Error during login.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;