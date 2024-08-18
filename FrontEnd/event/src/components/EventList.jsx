import { useState, useEffect } from "react";
import axios from "axios";

const EventList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/events`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEvents(response.data);
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h2>Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event._id}>
            {event.title} - {new Date(event.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
