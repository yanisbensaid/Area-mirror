import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useEditService } from '../../contexts/EditServiceContext';
import {
  EditServiceHeader,
  MessageDisplay,
  ServiceForm,
} from '../../components/services/editService';
import { LoadingState } from '../../components/services/LoadingState';

const EditService: React.FC = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const { isAdmin } = useCurrentUser();

  const {
    service,
    formData,
    loading,
    isUpdating,
    isDeleting,
    error,
    success,
    fetchService,
    updateFormData,
    updateService,
    deleteService,
  } = useEditService();

  // Fetch service data on mount
  useEffect(() => {
    if (!serviceId) {
      return;
    }
    fetchService(serviceId);
  }, [serviceId, fetchService]);

  // Handle navigation after successful operations
  useEffect(() => {
    if (success) {
      if (success.includes('deleted')) {
        // Navigate to services page after deletion
        const timer = setTimeout(() => {
          navigate('/services');
        }, 2000);
        return () => clearTimeout(timer);
      } else if (success.includes('updated')) {
        // Navigate back to service page after update
        const timer = setTimeout(() => {
          navigate(`/services/${serviceId}`);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [success, navigate, serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceId) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await updateService(serviceId, token);
  };

  const handleDelete = async () => {
    if (!serviceId || !service) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    await deleteService(serviceId, service.name, token);
  };

  // Loading state
  if (loading) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-12">
          <LoadingState message="Loading service..." />
        </div>
      </main>
    );
  }

  // Error state when service is not found
  if (error && !service) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to={serviceId ? `/services/${serviceId}` : '/services'}
            className="text-blue-600 hover:text-blue-800 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back to {serviceId ? 'Service' : 'Services'}
          </Link>
        </div>
      </main>
    );
  }

  if (!serviceId) {
    return (
      <main className="pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Invalid Service</h1>
          <p className="text-gray-600 mb-6">Service ID not provided</p>
          <Link
            to="/services"
            className="text-blue-600 hover:text-blue-800 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back to Services
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto py-12">
        {/* Header */}
        <EditServiceHeader
          serviceId={serviceId}
          title="Edit Service"
          description="Update your service information and settings"
        />

        {/* Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <MessageDisplay success={success} error={error} />

          <ServiceForm
            formData={formData}
            onInputChange={updateFormData}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
            isDeleting={isDeleting}
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />

          {/* Cancel Link */}
          <div className="mt-4">
            <Link
              to={`/services/${serviceId}`}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 text-center inline-block"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditService;
