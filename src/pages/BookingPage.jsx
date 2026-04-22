import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { apiRequest, authHeaders } from '../lib/api';

const services = [
  {
    id: 'royal',
    name: 'The Royal Treatment',
    price: 2499,
    duration: '120 mins',
    description: 'Our signature full grooming experience. Includes aromatherapy bath, breed-specific styling, ear cleaning, and a refreshing scent finish.',
    subtitle: 'Full Grooming + Spa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpevsfHciwov5L3a7X-SvXB3i9Ulu7aUdzHMHpyjG_Pv7jKu38vjA24g1CFk3F6ftmmrJGtRRGgCKt4a3vFpxzhFDKx7uAmikxSOeCVZSpWxHl6MJvXxKbhngi6e6UOjNB_3-7rDZz6ZbblWJpadcqrXI8U4WUUEZaaudZPOHca59ea46296UBU14Co7xRf93YHyOu0ENR746LnUy50yjxZ-3jRCihX0FSinqnzkbMhoudB348DBYZSLkOZ35qcQgOwTtiEA9f23I'
  },
  {
    id: 'splash',
    name: 'Splash & Scrub',
    price: 1299,
    duration: '60 mins',
    description: 'The perfect maintenance session. High-quality bath, blow-dry, and professional brush-out.',
    subtitle: 'Bath + Blow-dry',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASJ5cRgBAyjSC6Ytsw2L33yWcnDoPXoDTnQvzKhTrw-8yDgT9yo6eWdPvQCESQjpnalDsANoEY4FOLNFQfyefhxIznzKdslfDwzVKAtTxd_wUbV8dk_H3HbofUTkb70wzVD6vi5_yg1aH3Tlc0k9-B3dWbbzZGCxlOmfpBd3XwFWd73_FYjA7Wj3WpfIFCKWf622Sm9oD7XY1rQVm3hZ6YonSa0pe6aNY3yULA9ELXV-EELm_EqOJ3txYGLpasln4VdJXAVd_9N2U'
  },
  {
    id: 'paw',
    name: 'Paw-dicure',
    price: 599,
    duration: '20 mins',
    description: 'Essential nail clipping and paw pad care to keep your pet walking comfortably.',
    subtitle: 'Nail + Paw Care',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANo0BG-Pfr0e-b3JOQFc5h_wSXejZ5eHpZH9jwk1W0Icghf5HspeoWTgy4MCx18AT6c78iq1X4ajscjs30-lIWUdlxWQFZq9X9wKWHhmoSdzvbgrQdtg5vWV7fzS-UW373C5MeReyzFknyUrX0fonNB-o24USDWlscEhcc8dO3_ZGzi-yt18mRXNgsaf3JNlHU-AFEG3IQ4ithGSYhv9KfhT2zSZrAzfD__d12GokmZuOAzp-V2CVtcMwuAEBK64VJ_qxJSWjsCww'
  }
];

const DOG_BREEDS = [
  'Golden Retriever', 'Labrador Retriever', 'German Shepherd', 'Beagle',
  'Poodle', 'Bulldog', 'Shih Tzu', 'Rottweiler', 'Yorkshire Terrier',
  'Dachshund', 'Siberian Husky', 'Doberman', 'Pomeranian', 'Boxer',
  'Great Dane', 'Mixed Breed / Other'
];

const CAT_BREEDS = [
  'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'Bengal',
  'Sphynx', 'Abyssinian', 'British Shorthair', 'Russian Blue',
  'Birman', 'Scottish Fold', 'American Shorthair', 'Mixed Breed / Other'
];

const PET_TYPE_IMAGES = {
  dog: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg53R6rpxeqENEoAIPUNHiwSi53m3ucIRQ-ruqf7F_8TQ6-DGQyHo1ZMJ-3UzCP7vykoC33M43oaE69jHSop12QRXNlgq1HCX7p83OXkUxBYnzpqaznDhSamsaTqkZ8HW6oQ_qo5GH0_VIFVuNBu8WxjhFJCsqnkGKYtkcZGVlE7Sy_AnTXkPbjlh_NUEkGr9IcPSy_SSKUOM8KQmyGiIwscysTMtidJwwFDiMFsFMtCvJNC2YFvGslVkV7YaCjKTH6jaLScXCFGQ',
  cat: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-KlqEMTT-HUPff7j1SXhQxcsS5xTdsAe0rlKAwddX6ckaWZ90HVdWHDoIBdo0tF2Rlg90CKk93IYPfgz8PmZYnyDfL_bsLuOt7D4zerLpeaNl1wrQfgAbUxQCKKUbdtqBXL79hesjsuSVl2cSds5I2vgnajr24fNmH9UVcYVIBN8KU3aChR3ekDKM3QPwmqgck7cFOIn_R4OUeqRI4lQL5X-bugmBsH9k1CjgWe_vwhh7XmsgfbOn2tv1ZJ3x3xDIAY30xjiZefk'
};

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function BookingPage() {
  const { token } = useApp();

  const today = new Date();
  const [petType, setPetType] = useState('dog'); // 'dog' | 'cat'
  const [breed, setBreed] = useState(DOG_BREEDS[0]);
  const [petName, setPetName] = useState('');
  const [service, setService] = useState(services[0]);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { firstDay, daysInMonth } = buildCalendar(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDay(1);
  };

  const formattedDate = `${MONTH_NAMES[calMonth].slice(0, 3)} ${selectedDay}, ${calYear}`;
  const gst = Math.round(service.price * 0.18);
  const total = service.price + gst;
  const breedOptions = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const petLabel = petName.trim() || (petType === 'dog' ? 'Dog' : 'Cat');

  const submitBooking = async () => {
    if (!token) {
      setStatus('danger');
      setMessage('Please sign in to book an appointment.');
      return;
    }
    try {
      setStatus('');
      setIsLoading(true);
      setMessage('Processing...');
      const response = await apiRequest('/api/bookings', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({
          service: service.name,
          pet: petName || (petType === 'dog' ? 'Dog' : 'Cat'),
          breed,
          date: formattedDate,
          time: selectedTime,
          total: service.price
        })
      });
      setStatus('success');
      setIsConfirmed(true);
      setMessage(response.message || 'Booking confirmed successfully!');
    } catch (error) {
      setStatus('danger');
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid max-w-custom pt-custom pb-5">
      <header className="mb-5">
        <h1 className="display-5 fw-bold text-dark mb-3">Book a Grooming Session</h1>
        <p className="lead text-muted max-w-custom-sm">Tailored pampering for your beloved companions in a serene, atelier-inspired environment.</p>
      </header>

      {isConfirmed ? (
        <div className="surface-card p-5 rounded-5 shadow-lg text-center animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="mb-4">
            <div className="bg-success-light text-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 100, height: 100 }}>
              <span className="material-symbols-outlined fs-1" style={{ fontWeight: 'bold' }}>check_circle</span>
            </div>
            <h2 className="display-6 fw-bold mb-3">Booking Confirmed!</h2>
            <p className="lead text-muted mb-5">Your session for <span className="fw-bold text-dark">{petLabel}</span> has been successfully scheduled. We've sent a confirmation email to your registered address.</p>
          </div>

          <div className="bg-surface-low rounded-4 p-4 mb-5 text-start border border-light">
            <h3 className="h5 fw-bold mb-4 border-bottom pb-2">Appointment Details</h3>
            <div className="row g-3">
              <div className="col-sm-6">
                <p className="small text-muted text-uppercase fw-bold mb-1">Service</p>
                <p className="fw-bold text-dark">{service.name}</p>
              </div>
              <div className="col-sm-6">
                <p className="small text-muted text-uppercase fw-bold mb-1">Schedule</p>
                <p className="fw-bold text-dark">{formattedDate} • {selectedTime}</p>
              </div>
              <div className="col-sm-6">
                <p className="small text-muted text-uppercase fw-bold mb-1">Companion</p>
                <p className="fw-bold text-dark">{petLabel} ({breed})</p>
              </div>
              <div className="col-sm-6">
                <p className="small text-muted text-uppercase fw-bold mb-1">Total Paid</p>
                <p className="fw-bold text-primary-custom">₹{total.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
            <Link to="/" className="btn btn-primary-custom rounded-pill px-5 py-3 fw-bold">Back to Dashboard</Link>
            <button onClick={() => setIsConfirmed(false)} className="btn btn-light bg-surface-low rounded-pill px-5 py-3 fw-bold">Book Another</button>
          </div>
        </div>
      ) : (
        <div className="row g-5">
          {/* Left Column - Steps */}
          <div className="col-lg-8 d-flex flex-column gap-5">

            {/* Step 1 – Pet Type, Breed & Name */}
            <section>
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>1</span>
                <h2 className="h3 fw-bold mb-0">Select Your Companion</h2>
              </div>

              {/* Pet Type Toggle */}
              <div className="row g-3 mb-4">
                {['dog', 'cat'].map(type => (
                  <div className="col-6" key={type}>
                    <button
                      type="button"
                      onClick={() => {
                        setPetType(type);
                        setBreed(type === 'dog' ? DOG_BREEDS[0] : CAT_BREEDS[0]);
                      }}
                      className={`card w-100 text-start rounded-4 p-3 border-2 ${petType === type ? 'border-primary shadow-sm' : 'border-0 bg-surface-low hover-shadow'
                        }`}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={PET_TYPE_IMAGES[type]}
                          className={`rounded-circle object-fit-cover ${petType !== type ? 'opacity-60' : ''}`}
                          style={{ width: 72, height: 72 }}
                          alt={type}
                        />
                        <div>
                          <div className={`fw-bold fs-5 mb-0 ${petType !== type ? 'text-muted' : ''}`}>
                            {type === 'dog' ? '🐶 Dog' : '🐱 Cat'}
                          </div>
                          <div className="small text-muted">
                            {type === 'dog' ? '16 breeds available' : '13 breeds available'}
                          </div>
                          {petType === type && (
                            <span className="badge bg-secondary-light text-secondary-dark rounded-pill fw-bold text-uppercase mt-1">Selected</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Breed + Name */}
              <div className="surface-card p-4 rounded-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-uppercase" style={{ letterSpacing: '0.08em' }}>
                      <span className="material-symbols-outlined fs-6 me-1 text-primary-custom" style={{ verticalAlign: 'middle' }}>pet_supplies</span>
                      Breed
                    </label>
                    <select
                      className="form-select form-control-premium border-0 bg-surface-low rounded-3 py-3"
                      value={breed}
                      onChange={e => setBreed(e.target.value)}
                    >
                      {breedOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-uppercase" style={{ letterSpacing: '0.08em' }}>
                      <span className="material-symbols-outlined fs-6 me-1 text-primary-custom" style={{ verticalAlign: 'middle' }}>badge</span>
                      Pet's Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-premium border-0 bg-surface-low rounded-3 py-3"
                      placeholder={`e.g. ${petType === 'dog' ? 'Bruno, Max, Luna...' : 'Oliver, Mochi, Cleo...'}`}
                      value={petName}
                      onChange={e => setPetName(e.target.value)}
                    />
                  </div>
                  {breed && (
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-secondary-light">
                        <img src={PET_TYPE_IMAGES[petType]} className="rounded-circle object-fit-cover" style={{ width: 44, height: 44 }} alt="" />
                        <div>
                          <div className="fw-bold text-secondary-dark">{petName || (petType === 'dog' ? 'Your Dog' : 'Your Cat')}</div>
                          <div className="small text-muted">{breed} • {petType === 'dog' ? 'Dog' : 'Cat'}</div>
                        </div>
                        <span className="material-symbols-outlined text-primary-custom ms-auto">check_circle</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 2 – Service */}
            <section>
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>2</span>
                <h2 className="h3 fw-bold mb-0">Choose a Service</h2>
              </div>
              <div className="d-flex flex-column gap-4">
                {services.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setService(item)}
                    className={`card border-2 shadow-sm rounded-4 overflow-hidden text-start ${service.id === item.id ? 'border-primary' : 'border-transparent hover-border-primary'}`}
                  >
                    <div className="row g-0">
                      <div className="col-md-4" style={{ minHeight: 160 }}>
                        <img src={item.image} className="img-fluid object-fit-cover w-100 h-100" alt={item.name} />
                      </div>
                      <div className="col-md-8 p-4 d-flex flex-column justify-content-between">
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <h3 className={`h4 fw-bold mb-2 ${service.id === item.id ? '' : 'text-dark'}`}>{item.name}</h3>
                            <p className="text-muted small mb-2">{item.description}</p>
                            <div className={`d-flex align-items-center gap-2 fw-bold small ${service.id === item.id ? 'text-tertiary' : 'text-muted'}`}>
                              <span className="material-symbols-outlined fs-6">schedule</span> {item.duration}
                            </div>
                          </div>
                          <div className="text-end ms-3 flex-shrink-0">
                            <h4 className={`h3 fw-bolder mb-2 ${service.id === item.id ? 'text-primary-custom' : 'text-dark'}`}>₹{item.price.toLocaleString('en-IN')}</h4>
                            {service.id === item.id && <span className="badge bg-primary-custom rounded-pill">Selected</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 3 – Date & Time */}
            <section>
              <div className="d-flex align-items-center gap-3 mb-4">
                <span className="bg-primary-custom text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>3</span>
                <h2 className="h3 fw-bold mb-0">Schedule Your Visit</h2>
              </div>
              <div className="card border-0 shadow-sm rounded-4 p-4 surface-card">
                <div className="row g-5">
                  {/* Calendar */}
                  <div className="col-md-6 border-end">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="h5 fw-bold mb-0">{MONTH_NAMES[calMonth]} {calYear}</h4>
                      <div>
                        <button className="btn icon-btn rounded-circle" onClick={prevMonth} type="button">
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button className="btn icon-btn rounded-circle" onClick={nextMonth} type="button">
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between text-muted fw-bold small text-center mb-2 px-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                    </div>
                    <div className="d-flex flex-wrap text-center fw-bold">
                      {Array(firstDay).fill(null).map((_, i) => (
                        <div key={`empty-${i}`} className="p-2 w-14 text-muted"></div>
                      ))}
                      {Array(daysInMonth).fill(null).map((_, i) => {
                        const day = i + 1;
                        const isSelected = day === selectedDay;
                        return (
                          <div key={day} className="p-1 w-14">
                            <button
                              type="button"
                              onClick={() => setSelectedDay(day)}
                              className={`btn p-0 fw-bold rounded-circle d-inline-flex align-items-center justify-content-center ${isSelected ? 'bg-primary-custom text-white' : 'text-dark hover-bg-surface'}`}
                              style={{ width: 32, height: 32, fontSize: '0.9rem' }}
                            >
                              {day}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Time Slots */}
                  <div className="col-md-6">
                    <h4 className="h5 fw-bold mb-4">Available Slots</h4>
                    <div className="row g-2">
                      {TIME_SLOTS.map(slot => (
                        <div className="col-6" key={slot}>
                          <button
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`btn w-100 text-start py-3 rounded-3 fw-bold ${selectedTime === slot ? 'btn-primary-custom shadow-sm' : 'btn-light bg-surface-low'}`}
                          >
                            <div className="fw-bold fs-6">{slot}</div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {message && (
              <div className={`alert ${status === 'danger' ? 'alert-danger' : 'alert-success'} rounded-4`}>{message}</div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="col-lg-4">
            <div className="sticky-top" style={{ top: 100 }}>
              <div className="card border-0 bg-surface-low rounded-4 p-4 shadow-sm mb-4">
                <h2 className="h4 fw-bold mb-4 d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined text-primary-custom">receipt_long</span>
                  Booking Summary
                </h2>

                <div className="mb-4 border-bottom pb-4 border-light border-2">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <p className="small fw-bold text-muted text-uppercase mb-1" style={{ letterSpacing: 1 }}>Service</p>
                      <p className="fw-bold text-dark mb-0">{service.name}</p>
                      <p className="small text-muted">{service.subtitle}</p>
                    </div>
                    <span className="fw-bold text-dark">₹{service.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <p className="small fw-bold text-muted text-uppercase mb-1" style={{ letterSpacing: 1 }}>Companion</p>
                      <p className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined fs-6 text-primary-custom">pets</span>
                        {petLabel}
                      </p>
                      <p className="small text-muted mb-0">{breed} • {petType === 'dog' ? 'Dog' : 'Cat'}</p>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>
                      <p className="small fw-bold text-muted text-uppercase mb-1" style={{ letterSpacing: 1 }}>Schedule</p>
                      <p className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined fs-6 text-primary-custom">event</span>
                        {formattedDate} • {selectedTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mb-2 text-muted fw-bold">
                  <span>Subtotal</span>
                  <span>₹{service.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between mb-4 text-muted fw-bold">
                  <span>GST (18%)</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between border-top pt-3 border-light border-2 fw-bolder fs-4 text-dark mb-4">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="button"
                  onClick={submitBooking}
                  disabled={isLoading}
                  className="btn btn-primary-custom w-100 rounded-pill py-3 fw-bold fs-6 shadow-sm d-flex justify-content-center align-items-center gap-2 text-uppercase"
                  style={{ letterSpacing: 1 }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Booking <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
                <p className="small text-muted text-center mt-3 mb-0">
                  By confirming, you agree to our{' '}
                  <a href="#" className="text-primary-custom text-decoration-none fw-bold">Safety Policies</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-custom text-decoration-none fw-bold">Cancellation Terms</a>.
                </p>
              </div>

            </div>
          </aside>
        </div>
      )}
    </div>
  );
}