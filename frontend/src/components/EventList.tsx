import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchEvents } from '../store/eventStore';
import { EVENT_CATEGORIES } from '../constants/categories';
import CreateEvent from '../pages/CreateEvent';

export const EventList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector((state: RootState) => state.events);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<any>(null);

  // Attendee Modal States
  const [attendeeModalOpen, setAttendeeModalOpen] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState<any[]>([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [selectedEventIdForModal, setSelectedEventIdForModal] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'capacity'>('date');

  // Track registered event IDs for the current user
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Fetch events and user's registered events on mount
  useEffect(() => {
    dispatch(fetchEvents());
    if (userId && token) {
      fetchUserRegistrations();
    }
  }, [dispatch, userId, token]);

  const fetchUserRegistrations = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/registrations/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const ids = data.map((reg: any) => reg.event?.id || reg.eventId);
        setRegisteredEventIds(ids);
      }
    } catch (err) {
      console.error('Failed to fetch user registrations', err);
    }
  };

  // Strict check: defaults to false unless explicitly stored as ADMIN
  const storedRole = (localStorage.getItem('userRole') || localStorage.getItem('role') || '').trim().toUpperCase();
  const isAdmin = storedRole === 'ADMIN';

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        dispatch(fetchEvents());
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleRegisterToggle = async (eventId: string, isRegistered: boolean) => {
    try {
      let response;
      if (isRegistered) {
        response = await fetch(`http://localhost:8080/api/events/${eventId}/unregister`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await fetch(`http://localhost:8080/api/registrations?userId=${userId}&eventId=${eventId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        dispatch(fetchEvents());
        if (isRegistered) {
          setRegisteredEventIds(registeredEventIds.filter(id => id !== eventId));
        } else {
          setRegisteredEventIds([...registeredEventIds, eventId]);
        }
      } else {
        let errorMessage = 'Action failed';
        try {
          const err = await response.json();
          errorMessage = err.message || errorMessage;
        } catch {
          errorMessage = `Error status: ${response.status}`;
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Registration toggle error:', err);
    }
  };

  const handleViewAttendees = async (event: any) => {
    try {
      setSelectedEventIdForModal(event.id);
      const res = await fetch(`http://localhost:8080/api/registrations/${event.id}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const registrations = await res.json();
        setCurrentAttendees(registrations);
        setSelectedEventTitle(event.title);
        setAttendeeModalOpen(true);
      } else {
        alert('Failed to fetch attendees');
      }
    } catch (err) {
      console.error('Error fetching attendees', err);
      alert('Unable to connect to attendance endpoint.');
    }
  };

  const refreshAttendees = async (eventId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/registrations/${eventId}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const registrations = await res.json();
        setCurrentAttendees(registrations);
      }
    } catch (err) {
      console.error('Error refreshing attendees', err);
    }
  };

  const handleMarkAttended = async (registrationId: string, eventId: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/registrations/${registrationId}/mark-attended`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh the attendee list modal immediately
        refreshAttendees(eventId);
      } else {
        alert('Failed to mark attendance');
      }
    } catch (err) {
      console.error('Error marking attendance', err);
    }
  };

  const handleEditClick = (event: any) => {
    setSelectedEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const filteredEvents = (events || [])
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? event.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      }
      return b.capacity - a.capacity;
    });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
          Upcoming Events
        </h2>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                padding: '10px 18px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              + Create Event
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
        }}
      >
        <input
          type="text"
          placeholder="Search events by title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: '1 1 250px', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}
        >
          <option value="">All Categories</option>
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'capacity')}
          style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none' }}
        >
          <option value="date">Sort by Date</option>
          <option value="capacity">Sort by Capacity</option>
        </select>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#64748b' }}>Loading events...</p>}
      {error && <p style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px' }}>{error}</p>}

      {!loading && filteredEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', margin: 0 }}>No events found matching your filter criteria.</p>
        </div>
      )}

      {/* Events Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredEvents.map((event) => {
          const isRegistered = registeredEventIds.includes(event.id);

          return (
            <div
              key={event.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  {event.category}
                </span>
                <h3 style={{ margin: '12px 0 8px 0', fontSize: '20px', color: '#0f172a' }}>{event.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>{event.description}</p>
              </div>

              <div>
                <p style={{ fontSize: '14px', margin: '4px 0', color: '#334155' }}>📍 {event.location}</p>
                <p style={{ fontSize: '14px', margin: '4px 0', color: '#334155' }}>📅 {new Date(event.eventDate).toLocaleString()}</p>

                {/* Speaker Display Support */}
                {event.speakers && (
                  <p style={{ fontSize: '14px', margin: '4px 0', color: '#334155' }}>
                    🎤 Speakers: {Array.isArray(event.speakers) ? event.speakers.join(', ') : event.speakers}
                  </p>
                )}

                <p style={{ fontSize: '14px', margin: '4px 0 16px 0', color: '#334155' }}>
                  👥 {event.attendeeCount || 0} / {event.capacity} Attending
                </p>

                {/* Dynamic Register / Cancel Button */}
                <button
                  onClick={() => handleRegisterToggle(event.id, isRegistered)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: isRegistered ? '#ef4444' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: isAdmin ? '8px' : '0',
                  }}
                >
                  {isRegistered ? 'Cancel Registration' : 'Register'}
                </button>

                {/* Admin Management Buttons */}
                {isAdmin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => handleViewAttendees(event)}
                      style={{
                        padding: '6px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      View Attendees
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditClick(event)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#eab308',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateEvent isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {isEditModalOpen && (
        <CreateEvent
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEventToEdit(null);
          }}
          eventDataToEdit={selectedEventToEdit}
        />
      )}

      {/* Attendee List Modal */}
      {attendeeModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '8px',
              width: '480px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                Attendees: {selectedEventTitle}
              </h3>
              <button
                onClick={() => setAttendeeModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {currentAttendees.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
                No users have registered for this event yet.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {currentAttendees.map((reg: any, index: number) => (
                  <li
                    key={reg.id || index}
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      fontSize: '14px',
                      color: '#334155',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600' }}>
                      <span>👤 {reg.user?.fullName || reg.user?.email || 'Registered User'}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            color: reg.status === 'ATTENDED' ? '#15803d' : '#2563eb',
                            backgroundColor: reg.status === 'ATTENDED' ? '#f0fdf4' : '#eff6ff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {reg.status}
                        </span>

                        {reg.status !== 'ATTENDED' && (
                          <button
                            onClick={() => handleMarkAttended(reg.id, selectedEventIdForModal)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#16a34a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      📧 {reg.user?.email || 'N/A'} | 📅 Signed up: {reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : 'N/A'}
                    </div>
                    {reg.attendedAt && (
                      <div style={{ fontSize: '12px', color: '#15803d' }}>
                        ✅ Attended at: {new Date(reg.attendedAt).toLocaleString()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setAttendeeModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;