import { useState, useEffect } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(response.data);
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error(err);
      alert("Error deleting user.");
    }
  };

  const startEditing = (user) => {
    setEditingUser(user._id);
    setName(user.name);
    setEmail(user.email);
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
  };

  const updateUser = async (userId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedUser = response.data.user;
        setUsers(
          users.map((user) =>
            user._id === userId
              ? { ...user, name: updatedUser.name, email: updatedUser.email }
              : user
          )
        );
        cancelEditing();
      } else {
        alert("Failed to update user.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user.");
    }
  };

  return (
    <div>
      <h2>All Users</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Actions</th>{" "}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                {editingUser === user._id ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {editingUser === user._id ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>{user.age}</td>
              <td>
                {editingUser === user._id ? (
                  <>
                    <button onClick={() => updateUser(user._id)}>Save</button>
                    <button onClick={cancelEditing}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEditing(user)}>Edit</button>
                    <button onClick={() => handleDelete(user._id)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
