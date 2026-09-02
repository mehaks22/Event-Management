import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { fetchEvents } from '../store/eventStore';
import { EVENT_CATEGORIES } from '../constants/categories';
import API from '../services/api';

interface CreateEventProps {
  isOpen: boolean;
  onClose: () => void;
  eventDataToEdit?: any;
}

export const CreateEvent: React.FC<CreateEventProps> = ({ isOpen, onClose, eventDataToEdit }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EVENT_CATEGORIES[0] || '');
  const [eventDate, setEventDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [speakers, setSpeakers] = useState('');

  useEffect(() => {
    if (eventDataToEdit) {
      setTitle(eventDataToEdit.title || '');
      setCategory(eventDataToEdit.category || EVENT_CATEGORIES[0]);
      if (eventDataToEdit.eventDate) {
        const dateStr = new Date(eventDataToEdit.eventDate).toISOString().slice(0, 16);
        setEventDate(dateStr);
      } else {
        setEventDate('');
      }
      setCapacity(eventDataToEdit.capacity ? String(eventDataToEdit.capacity) : '');
      setLocation(eventDataToEdit.location || '');
      setDescription(eventDataToEdit.description || '');

      if (eventDataToEdit.speakers) {
        const speakerVal = Array.isArray(eventDataToEdit.speakers)
          ? eventDataToEdit.speakers.join(', ')
          : eventDataToEdit.speakers;
        setSpeakers(speakerVal);
      } else {
        setSpeakers('');
      }
    } else {
      setTitle('');
      setCategory(EVENT_CATEGORIES[0] || '');
      setEventDate('');
      setCapacity('');
      setLocation('');
      setDescription('');
      setSpeakers('');
    }
  }, [eventDataToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedDate = eventDate
      ? (eventDate.length === 16 ? eventDate + ':00' : eventDate)
      : null;

    const speakersArray = speakers
      ? speakers.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      title,
      category,
      eventDate: formattedDate,
      capacity: Number(capacity),
      location,
      description,
      speakers: speakersArray,
    };

    try {
      if (eventDataToEdit) {
        await API.put(`/events/${eventDataToEdit.id}`, payload);
      } else {
        await API.post('/events', payload);
      }

      dispatch(fetchEvents());
      onClose();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
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
          width: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>
            {eventDataToEdit ? 'Edit Event' : 'Create New Event'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>EVENT TITLE</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>CATEGORY</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', backgroundColor: '#fff', boxSizing: 'border-box' }}
            >
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>DATE & TIME</label>
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>CAPACITY</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>LOCATION</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>SPEAKERS (COMMA SEPARATED)</label>
            <input
              type="text"
              placeholder="e.g. John Doe, Jane Smith"
              value={speakers}
              onChange={(e) => setSpeakers(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {eventDataToEdit ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;