import React, { useEffect, useState } from 'react';
import './Events.css';
import axios from 'axios';

function Events({ showTicketForm, expandEvent, user }) {
  const [events, setEvents] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    event_date: '',
    event_time: '',
    place: '',
    description: '',
    plan: '',
    normal_ticket_price: '',
    vip_ticket_price: '',
    image: null
  });

 // const [ setEditPopupEvent] = useState(null);
const [confirmDeleteName, setConfirmDeleteName] = useState('');
const [selectedEvent, setSelectedEvent] = useState('');
const [showModifyPopup, setShowModifyPopup] = useState(false);
const [showConfirmDeletePopup, setShowConfirmDeletePopup] = useState(false);


  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:8000/events/list/');
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('name', newEvent.name);
      formData.append('event_date', newEvent.event_date);
      formData.append('event_time', newEvent.event_time);
      formData.append('place', newEvent.place);
      formData.append('description', newEvent.description);
      formData.append('plan', newEvent.plan);
      formData.append('normal_ticket_price', newEvent.normal_ticket_price);
      formData.append('vip_ticket_price', newEvent.vip_ticket_price);
      if (newEvent.image) {
        formData.append('image', newEvent.image);
      }

      const res = await axios.post('http://localhost:8000/events/create/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      if (res.status === 201 || res.status === 200) {
        alert("Event added successfully!");
        setShowAddPopup(false);
        setNewEvent({
          name: '',
          event_date: '',
          event_time: '',
          place: '',
          description: '',
          plan: '',
          normal_ticket_price: '',
          vip_ticket_price: '',
          image: null
        });
        fetchEvents();
      }
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Unauthorized or invalid data.");
    }
  };

 const handleUpdateEvent = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const res = await axios.put(
      `http://localhost:8000/events/update/${selectedEvent.id}/`,
      {
        name: selectedEvent.name,
        event_date: selectedEvent.event_date,
        event_time: selectedEvent.event_time,
        place: selectedEvent.place,
        normal_ticket_price: selectedEvent.normal_ticket_price,
        vip_ticket_price: selectedEvent.vip_ticket_price,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Event updated:', res.data);
    setShowModifyPopup(false);
  } catch (error) {
    console.error('Error updating event:', error);
  }
};


const handleDeleteEvent = async (id) => {
  try {
    const token = localStorage.getItem('access_token');
    await axios.delete(`http://localhost:8000/events/delete/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Event deleted.");
    fetchEvents();
  } catch (error) {
    alert("Failed to delete event.");
    console.error(error);
  }
};


  return (
   <section id="events" className="events-section">
  <h2>Upcoming Events</h2>

  {user?.role === 'admin' && (
    <div style={{ textAlign: 'right', marginBottom: '10px' }}>
      <button className="add-event-btn" onClick={() => setShowAddPopup(true)}>
        + Add Event
      </button>
    </div>
  )}

  <div className="event-grid">
    {events.map((event, idx) => (
      <div key={idx} className="event-card" onClick={(e) => expandEvent(e.currentTarget, e)}>
        <div className="event-content">
          <div className="event-header">
            <img src={event.image || '/default-event.jpg'} alt="Event" />
            <div className="event-info">
              <h3>{event.name}</h3>
              <p>{new Date(event.date).toLocaleString()}</p>
              <p>{event.place}</p>
            </div>
          </div>
          <div className="event-details">
            <h4>Ticket Prices</h4>
            <p>Normal: {event.normal_ticket_price} DT</p>
            <p>VIP: {event.vip_ticket_price} DT</p>
            <button className="ticket-btn" onClick={(e) => { e.stopPropagation(); showTicketForm(); }}>
              Get Your Ticket Now
            </button>
            {user?.role === 'admin' && (
              <button className="modify-btn" onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
                setShowModifyPopup(true);
              }}>
                Modify Info
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Add Event Popup */}
  {showAddPopup && (
    <div className="popup-overlay">
      <div className="popup-form">
        <h3>Add New Event</h3>
        <input type="text" placeholder="Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
        <input type="date" placeholder="Date" value={newEvent.event_date} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} />
        <input type="time" placeholder="Time" value={newEvent.event_time} onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })} />
        <input type="text" placeholder="Place" value={newEvent.place} onChange={(e) => setNewEvent({ ...newEvent, place: e.target.value })} />
        <textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
        <textarea placeholder="Plan" value={newEvent.plan} onChange={(e) => setNewEvent({ ...newEvent, plan: e.target.value })}></textarea>
        <input type="number" placeholder="Normal Ticket Price" value={newEvent.normal_ticket_price} onChange={(e) => setNewEvent({ ...newEvent, normal_ticket_price: e.target.value })} />
        <input type="number" placeholder="VIP Ticket Price" value={newEvent.vip_ticket_price} onChange={(e) => setNewEvent({ ...newEvent, vip_ticket_price: e.target.value })} />
        <input type="file" accept="image/*" onChange={(e) => setNewEvent({ ...newEvent, image: e.target.files[0] })} />

        <div className="popup-buttons">
          <button onClick={handleAddEvent}>Save</button>
          <button onClick={() => setShowAddPopup(false)}>Cancel</button>
        </div>
      </div>
    </div>
  )}

  {/* Modify Event Popup */}
  {showModifyPopup && selectedEvent && (
    <div className="popup-overlay">
      <div className="popup-form">
        <h3>Modify Event Info</h3>
        <input type="text" value={selectedEvent.name} onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })} />
<input
  type="date"
  value={selectedEvent.event_date||''}
  onChange={(e) =>
    setSelectedEvent({ ...selectedEvent, event_date: e.target.value })
    
  }

/>

<input
  type="time"
  value={selectedEvent.event_time||''}
  onChange={(e) =>
    setSelectedEvent({ ...selectedEvent, event_time: e.target.value })
  }
/>        <input type="text" value={selectedEvent.place} onChange={(e) => setSelectedEvent({ ...selectedEvent, place: e.target.value })} />
        <input type="number" value={selectedEvent.normal_ticket_price} onChange={(e) => setSelectedEvent({ ...selectedEvent, normal_ticket_price: e.target.value })} />
        <input type="number" value={selectedEvent.vip_ticket_price} onChange={(e) => setSelectedEvent({ ...selectedEvent, vip_ticket_price: e.target.value })} />
        <textarea value={selectedEvent.description} onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}></textarea>

        <div className="popup-buttons">
          <button onClick={() => handleUpdateEvent(selectedEvent)}>Modify</button>
          <button onClick={() => {
            setConfirmDeleteName('');
            setShowConfirmDeletePopup(true);
          }}>Delete</button>
          <button onClick={() => setShowModifyPopup(false)}>Cancel</button>
        </div>
      </div>
    </div>
  )}

  {/* Confirm Delete Popup */}
  {showConfirmDeletePopup && (
    <div className="popup-overlay">
      <div className="popup-form">
        <h4>Type the event name to confirm deletion:</h4>
        <input type="text" placeholder="Event Name" value={confirmDeleteName} onChange={(e) => setConfirmDeleteName(e.target.value)} />
        <div className="popup-buttons">
          <button
            onClick={() => {
              if (confirmDeleteName === selectedEvent.name) {
                handleDeleteEvent(selectedEvent.id);
                setShowConfirmDeletePopup(false);
                setShowModifyPopup(false);
              } else {
                alert("Event name does not match!");
              }
            }}
          >
            Confirm Delete
          </button>
          <button onClick={() => setShowConfirmDeletePopup(false)}>Cancel</button>
        </div>
      </div>
    </div>
  )}
</section>

  );
}

export default Events;
