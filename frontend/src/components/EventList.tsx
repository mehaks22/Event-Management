import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchEvents } from '../store/eventStore';
import { EVENT_CATEGORIES } from '../constants/categories';
import CreateEvent from '../pages/CreateEvent';
import API from '../services/api';

export const EventList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector((state: RootState) => state.events);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<any>(null);

  const [attendeeModalOpen, setAttendeeModalOpen] = useState(false);
  const [currentAttendees, setCurrentAttendees] = useState<any[]>([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [selectedEventIdForModal, setSelectedEventIdForModal] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'capacity'>('date');

  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    dispatch(fetchEvents());
    if (userId && token) {
      fetchUserRegistrations();
    }
  }, [dispatch, userId, token]);

  const fetchUserRegistrations = async () => {
    try {
      const res = await API.get(`/registrations/user/${userId}`);
      const data = res.data;
      const ids = data.map((reg: any) => reg.event?.id || reg.eventId);
      setRegisteredEventIds(ids);
    } catch (err) {
      console.error('Failed to fetch user registrations', err);
    }
  };

  const storedRole = (localStorage.getItem('userRole') || localStorage.getItem('role') || '').trim().toUpperCase();
  const isAdmin = storedRole === 'ADMIN';

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await API.delete(`/events/${eventId}`);
      dispatch(fetchEvents());
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleRegisterToggle = async (eventId: string, isRegistered: boolean) => {
    try {
      if (isRegistered) {
        await API.delete(`/events/${eventId}/unregister`);
      } else {
        await API.post(`/registrations?userId=${userId}&eventId=${eventId}`);
      }

      dispatch(fetchEvents());
      if (isRegistered) {
        setRegisteredEventIds(registeredEventIds.filter((id) => id !== eventId));
      } else {
        setRegisteredEventIds([...registeredEventIds, eventId]);
      }
    } catch (err: any) {
      console.error('Registration toggle error:', err);
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleViewAttendees = async (event: any) => {
    try {
      setSelectedEventIdForModal(event.id);
      const res = await API.get(`/registrations/${event.id}/registrations`);
      setCurrentAttendees(res.data);
      setSelectedEventTitle(event.title);
      setAttendeeModalOpen(true);
    } catch (err) {
      console.error('Error fetching attendees', err);
      alert('Unable to connect to attendance endpoint.');
    }
  };

  const refreshAttendees = async (eventId: string) => {
    try {
      const res = await API.get(`/registrations/${eventId}/registrations`);
      setCurrentAttendees(res.data);
    } catch (err) {
      console.error('Error refreshing attendees', err);
    }
  };

  const handleMarkAttended = async (registrationId: string, eventId: string) => {
    try {
      await API.put(`/registrations/${registrationId}/mark-attended`);
      refreshAttendees(eventId);
    } catch (err) {
      console.error('Error marking attendance', err);
      alert('Failed to mark attendance');
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

                {event.speakers && (
                  <p style={{ fontSize: '14px', margin: '4px 0', color: '#334155' }}>
                    🎤 Speakers: {Array.isArray(event.speakers) ? event.speakers.join(', ') : event.speakers}
                  </p>
                )}

                <p style={{ fontSize: '14px', margin: '4px 0 16px 0', color: '#334155' }}>
                  👥 {event.attendeeCount || 0} / {event.capacity} Attending
                </p>

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
                Attendees for {selectedEventTitle}
              </h3>
              <button onClick={() => setAttendeeModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {currentAttendees.length === 0 ? (
              <p style={{ color: '#64748b' }}>No attendees registered yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {currentAttendees.map((reg: any) => (
                  <li
                    key={reg.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#0f172a' }}>
                        {reg.userName || reg.user?.fullName || 'Registered User'}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        Status: {reg.attended ? 'Attended' : 'Registered'}
                      </p>
                    </div>
                    {!reg.attended && (
                      <button
                        onClick={() => handleMarkAttended(reg.id, selectedEventIdForModal)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#16a34a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Mark Attended
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};