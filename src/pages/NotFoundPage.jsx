import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-5 fw-bold mb-3">Page not found</h1>
      <p className="text-muted mb-4">The page you requested does not exist.</p>
      <Link to="/" className="btn btn-primary-custom rounded-pill px-4 py-2 fw-bold">Back Home</Link>
    </div>
  );
}