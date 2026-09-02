/*
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEventStore } from '@/store/eventStore';
import { useAuthStore } from '@/store/authStore';
import CreateEvent from '../pages/CreateEvent';
import { EVENT_CATEGORIES } from '@/constants/categories';

const Events = () => {
  const { events, fetchEvents, isLoading } = useEventStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCategoryChange = (newCategory: string) => {
    if (newCategory === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', newCategory);
    }
    setSearchParams(searchParams);
  };

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      event.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(event.category?.toLowerCase());

    const matchesSearch =
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase()) ||
      event.location?.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Read role safely from localStorage
    const storedRole = (localStorage.getItem('userRole') || '').trim().toUpperCase();
    const isAdmin = storedRole === 'ADMIN';

  return (
    <div style={{
      minHeight: 'calc(100vh - 65px)',
      backgroundColor: '#f5f2eb',
      color: '#292524',
      padding: '2rem 1.5rem',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        { */
/* Hero Section *//*
}
                <div style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  padding: '2rem 2.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  boxSizing: 'border-box',
                  border: '1px solid #e7e5e4',
                  boxShadow: '0 4px 12px rgba(120, 113, 108, 0.05)'
                }}>
                  <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '800', margin: 0, color: '#1c1917', letterSpacing: '-0.025em' }}>
                      Discover Events
                    </h1>
                    <p style={{ margin: '0.35rem 0 0 0', color: '#78716c', fontSize: '0.9rem' }}>
                      Find, organize, and register for amazing community events.
                      { */
/* VISUAL DEBUGGER: This will show your current role on the screen *//*
}
                      <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>
                        [DEBUG Role: {localStorage.getItem('userRole') || 'NONE'}]
                      </span>
                    </p>
                  </div>

                  { */
/* EMERGENCY OVERRIDE: Change this to true if you want to force hide it right now, false to test normally *//*
}
                  {(() => {
                    const currentRole = (localStorage.getItem('userRole') || '').trim().toUpperCase();
                    const forcedIsAdmin = currentRole === 'ADMIN'; // If this is true, the button shows
                    {isAdmin ? (
                                <button
                                  onClick={() => setIsModalOpen(true)}
                                  style={{
                                    backgroundColor: '#ea580c',
                                    color: '#ffffff',
                                    fontWeight: '700',
                                    padding: '0.65rem 1.35rem',
                                    borderRadius: '0.5rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  + Create Event
                                </button>
                              ) : null}


                      <span style={{
                        fontSize: '0.75rem',
                        color: '#a8a29e',
                        backgroundColor: '#fafaf9',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #e7e5e4'
                      }}>
                        Admin access required to create events
                      </span>
                    );
                  })()}
                </div>




        { */
/* Filter Controls *//*
}
        <div style={{
          width: '100%',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          backgroundColor: '#ffffff',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid #e7e5e4',
          boxSizing: 'border-box'
        }}>
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 250px',
              padding: '0.65rem 1rem',
              border: '1px solid #d6d3d1',
              borderRadius: '0.5rem',
              backgroundColor: '#fafaf9',
              color: '#1c1917',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{
              width: '200px',
              padding: '0.65rem 1rem',
              border: '1px solid #d6d3d1',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              backgroundColor: '#fafaf9',
              color: '#1c1917',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="All">All Categories</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        { */
/* Event Cards Grid *//*
}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#78716c', fontSize: '0.9rem' }}>
            Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{
            width: '100%',
            backgroundColor: '#ffffff',
            border: '2px dashed #d6d3d1',
            borderRadius: '0.75rem',
            padding: '4rem 2rem',
            textAlign: 'center',
            color: '#78716c'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1c1917' }}>No matching events found</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#78716c' }}>
              Try adjusting your search terms or category filter.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            width: '100%'
          }}>
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e7e5e4',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(120, 113, 108, 0.05)'
                }}
              >
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.625rem',
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    border: '1px solid #ffedd5',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    borderRadius: '0.375rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.85rem',
                    letterSpacing: '0.05em'
                  }}>
                    {event.category}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1c1917' }}>
                    {event.title}
                  </h3>
                  <p style={{ margin: '0.65rem 0 0 0', color: '#57534e', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    {event.description}
                  </p>
                </div>
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid #f5f5f4',
                  fontSize: '0.775rem',
                  color: '#78716c',
                  fontWeight: '500'
                }}>
                  📍 {event.location || 'Online'}
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateEvent isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  );
};

export default Events; */
