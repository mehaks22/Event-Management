import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiArrowLeft,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
} from 'react-icons/fi';

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEvent, isLoading, fetchEventById, registerForEvent, deleteEvent } = useEventStore();
  const { user, isAuthenticated } = useAuthStore();
  // NOTE: the backend has no "am I registered" or "my registrations" endpoint,
  // so this only reflects a registration made during this page visit — it
  // will reset on refresh. Add a real check server-side if you want this to
  // persist across reloads.
  const [justRegistered, setJustRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <FiArrowLeft /> Back to Events
        </button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
        </div>
      </div>
    );
  }

  const isFull = currentEvent.attendeeCount >= currentEvent.capacity;
  const isAdmin = user?.role === 'ADMIN';
  const eventDateObj = new Date(currentEvent.eventDate);
  const isEventPassed = !currentEvent.isActive || new Date() > eventDateObj;

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register');
      navigate('/login');
      return;
    }

    if (isFull) {
      toast.error('Event is full');
      return;
    }

    setIsRegistering(true);
    try {
      await registerForEvent(currentEvent.id);
      setJustRegistered(true);
      toast.success('Successfully registered for event!');
    } catch (err) {
      toast.error('Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(currentEvent.id);
        toast.success('Event deleted');
        navigate('/events');
      } catch (err) {
        toast.error('Failed to delete event');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <FiArrowLeft /> Back
          </button>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/events/${currentEvent.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
              >
                <FiEdit /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Banner — Event type has no imageUrl field, so this is a placeholder */}
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl h-96 mb-8 overflow-hidden flex items-center justify-center">
          <FiCalendar className="text-white text-6xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Title & Status */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{currentEvent.title}</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{currentEvent.category}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isEventPassed
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isEventPassed ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentEvent.description}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FiCalendar className="text-blue-600 text-xl" />
                  <div>
                    <p className="text-sm text-gray-600">Date &amp; Time</p>
                    <p className="font-semibold text-gray-900">
                      {eventDateObj.toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <FiMapPin className="text-blue-600 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{currentEvent.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Capacity Card */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Registrations</h3>
                  <FiUsers className="text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {currentEvent.attendeeCount}/{currentEvent.capacity}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (currentEvent.attendeeCount / currentEvent.capacity) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Action Button */}
              {isAuthenticated && !isEventPassed ? (
                justRegistered ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 font-semibold py-3 rounded-lg cursor-default"
                  >
                    <FiCheckCircle /> Registered
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || isFull}
                    className={`w-full font-semibold py-3 rounded-lg transition ${
                      isFull
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white'
                    }`}
                  >
                    {isRegistering ? 'Registering...' : isFull ? 'Event Full' : 'Register Now'}
                  </button>
                )
              ) : !isAuthenticated && !isEventPassed ? (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                >
                  Login to Register
                </button>
              ) : (
                <button disabled className="w-full bg-gray-300 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
                  Event Ended
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;