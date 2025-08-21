
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

  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [showModifyPopup, setShowModifyPopup] = useState(false);
  const [showConfirmDeletePopup, setShowConfirmDeletePopup] = useState(false);

  const [receiptData, setReceiptData] = useState({});
  const [showReservePopup, setShowReservePopup] = useState(false);
  const [selectedEventForReservation, setSelectedEventForReservation] = useState(null);
  const [fullName, setFullName] = useState('');
  const [ticketType, setTicketType] = useState('normal');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [quantity, setQuantity] = useState(1);

  const [popupMessage, setPopupMessage] = useState('');
const [showPopup, setShowPopup] = useState(false);

const showAlert = (message) => {
  setPopupMessage(message);
  setShowPopup(true);
};

  const fetchEvents = async () => {
  try {
    const res = await axios.get('http://localhost:8000/events/list/');
    setEvents(res.data);

    const token = localStorage.getItem('access_token');
    if (token) {
      const reservationRequests = res.data.map(event =>
        axios
          .get(`http://localhost:8000/events/reservations/${event.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(response => ({
            eventId: event.id,
            data: response.data,
          }))
          .catch(() => ({
            eventId: event.id,
            data: null,
          }))
      );

      const reservations = await Promise.all(reservationRequests);
      const newReceiptData = {};
      reservations.forEach(res => {
        newReceiptData[res.eventId] = res.data?.receipt_number ? res.data : null;
      });
      setReceiptData(newReceiptData);
    }
  } catch (error) {
    console.error('Failed to fetch events:', error);
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
      formData.append('max_attendees', newEvent.max_attendees);
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
        showAlert("Event added successfully!");
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
          max_attendees: '',
          image: null
        });
        fetchEvents();
      }
    } catch (error) {
      console.error("Error adding event:", error);
      showAlert("Unauthorized or invalid data.");
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
          max_attendees: selectedEvent.max_attendees,
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
      showAlert("Event deleted.");
      fetchEvents();
    } catch (error) {
      showAlert("Failed to delete event.");
      console.error(error);
    }
  };

  const handleReservationSubmit = async () => {
  const token = localStorage.getItem("access_token");
  
  try {
    const res = await axios.post(`http://localhost:8000/events/reservations/`, {
      event: selectedEventForReservation.id,
      full_name: fullName,
      ticket_type: ticketType,
      address: ticketType === 'vip' ? address : '',
      quantity: quantity,
      payment_method: paymentMethod
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    showAlert(`Reservation successful!\nReceipt #: ${res.data.receipt_number}`);
    setReceiptData(prev => ({ ...prev, [selectedEventForReservation.id]: res.data }));
    setShowReservePopup(false);
  } catch (err) {
    showAlert(err.response?.data?.detail || "Reservation failed.");
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
                <p>Description: {event.description}</p>
                <p>Plan: {event.plan}</p>
                <p>Max_attendees: {event.max_attendees}</p>
              {receiptData[event.id] ? (
  <button
    className="ticket-btn"
    onClick={(e) => {
      e.stopPropagation();
      const res = receiptData[event.id];

      const normalPrice = event.normal_ticket_price;
      const vipPrice = event.vip_ticket_price;

      // If you stored quantity and ticket_type in receiptData:
      const totalPrice =
        res.ticket_type === 'vip'
          ? res.quantity * vipPrice
          : res.quantity * normalPrice;

      showAlert(
        `Receipt Number: ${res.receipt_number}\n` +
        `Name: ${res.full_name}\n` +
        `Ticket Type: ${res.ticket_type}\n` +
        `Quantity: ${res.quantity}\n` +
        `Total Price: ${totalPrice} DT\n` +
        (res.ticket_type === 'vip' ? `\n
          Delivery Address: ${res.address}` : '')
      );
    }}
  >
    Check Your Receipt
  </button>
) : (
  <button
    className="ticket-btn"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedEventForReservation(event);
      setShowReservePopup(true);
    }}
  >
    Get Your Bracelet Now
  </button>
)}

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
{/* Reserve Bracelet Popup */}
{showReservePopup && (
  <div className="popup-overlay">
    <div className="popup-form">
      <h3>Reserve for {selectedEventForReservation.name}</h3>
      <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />

      <label>
        <input type="radio" value="normal" checked={ticketType === 'normal'} onChange={() => setTicketType('normal')} /> Normal Ticket
      </label>
      <label>
        <input type="radio" value="vip" checked={ticketType === 'vip'} onChange={() => setTicketType('vip')} /> VIP Ticket
      </label>

      {ticketType === 'vip' && (
        <input type="text" placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} />
      )}

      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" />

<p>
  <strong>Total Price:</strong>{' '}
  {ticketType === 'vip'
    ? quantity * selectedEventForReservation.vip_ticket_price
    : quantity * selectedEventForReservation.normal_ticket_price
  } DT
</p>


      <label>
        <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Pay with Card
      </label>
      <label>
        <input type="radio" value="reception" checked={paymentMethod === 'reception'} onChange={() => setPaymentMethod('reception')} /> Pay at Reception
      </label>

      <div className="popup-buttons">
        <button onClick={handleReservationSubmit}>Pay</button>
        <button onClick={() => setShowReservePopup(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}


    
{/* Add Event Popup */}
  {showAddPopup && (
    <div className="popup-overlay">
      <div className="popup-form">
        <h3>Add New Event</h3>
        <input type="text" placeholder="Name" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
        <input type="date" placeholder="Date" value={newEvent.event_date} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} />
        <input type="time" placeholder="Time" value={newEvent.event_time} onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })} />
        <input type="text" placeholder="Place" value={newEvent.place} onChange={(e) => setNewEvent({ ...newEvent, place: e.target.value })} />
        <input type="number" placeholder="Maximum Attendees" value={newEvent.max_attendees} onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}/>
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
        <input type="date" value={selectedEvent.event_date||''} onChange={(e) =>  setSelectedEvent({ ...selectedEvent, event_date: e.target.value })}/>
        <input type="time" value={selectedEvent.event_time||''}  onChange={(e) => setSelectedEvent({ ...selectedEvent, event_time: e.target.value })  }/>
        <input type="text" value={selectedEvent.place} onChange={(e) => setSelectedEvent({ ...selectedEvent, place: e.target.value })} />
        <input type="number" value={selectedEvent.normal_ticket_price} onChange={(e) => setSelectedEvent({ ...selectedEvent, normal_ticket_price: e.target.value })} />
        <input type="number" value={selectedEvent.vip_ticket_price} onChange={(e) => setSelectedEvent({ ...selectedEvent, vip_ticket_price: e.target.value })} />
        <input type="number" value={selectedEvent.max_attendees} onChange={(e) => setSelectedEvent({ ...selectedEvent, max_attendees: e.target.value })} />
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
                showAlert("Event name does not match!");
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
  {showPopup && (
  <div className="popup-overlay">
    <div className="popup-form">
      <p>{popupMessage}</p>
      <div className="popup-buttons">
        <button onClick={() => setShowPopup(false)}>Close</button>
      </div>
    </div>
  </div>
)}
    </section>
  );
}

  export default Events;