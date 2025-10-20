import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
  auth_type: string;
  icon_url?: string;
}

interface Action {
  id: number;
  name: string;
  description: string;
  service_id: number;
}

interface Reaction {
  id: number;
  name: string;
  description: string;
  service_id: number;
}

interface Automation {
  id: number;
  name: string;
  description: string;
  action_id: number;
  reaction_id: number;
  is_active: boolean;
  action: Action;
  reaction: Reaction;
  trigger_service: Service;
  action_service: Service;
}

export default function CreateAutomation() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { isAdmin } = useCurrentUser();
  
  const [services, setServices] = useState<Service[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingAutomations, setDeletingAutomations] = useState<{[key: number]: boolean}>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_service_id: serviceId || '',
    action_service_id: '',
    action_id: '',
    reaction_id: '',
    category: '',
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all services
        const servicesResponse = await fetch('http://localhost:8000/api/services');
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData.server.services || []);
        }

        // Fetch existing automations for the service if serviceId is provided
        if (serviceId) {
          const automationsResponse = await fetch(`http://localhost:8000/api/services/${serviceId}/automations`);
          if (automationsResponse.ok) {
            const automationsData = await automationsResponse.json();
            setAutomations(automationsData.server.automations || []);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  // Fetch actions when trigger service changes
  useEffect(() => {
    const fetchActions = async () => {
      if (formData.trigger_service_id) {
        try {
          const response = await fetch(`http://localhost:8000/api/services/${formData.trigger_service_id}/actions`);
          if (response.ok) {
            const data = await response.json();
            console.log('Actions response:', data);
            setActions(data.server?.actions || []);
          } else {
            console.log('No actions found or service not found');
            setActions([]);
          }
        } catch (error) {
          console.error('Error fetching actions:', error);
          setActions([]);
        }
      } else {
        setActions([]);
      }
    };

    fetchActions();
  }, [formData.trigger_service_id]);

  // Fetch reactions when action service changes
  useEffect(() => {
    const fetchReactions = async () => {
      if (formData.action_service_id) {
        try {
          const response = await fetch(`http://localhost:8000/api/services/${formData.action_service_id}/reactions`);
          if (response.ok) {
            const data = await response.json();
            console.log('Reactions response:', data);
            setReactions(data.server?.reactions || []);
          } else {
            console.log('No reactions found or service not found');
            setReactions([]);
          }
        } catch (error) {
          console.error('Error fetching reactions:', error);
          setReactions([]);
        }
      } else {
        setReactions([]);
      }
    };

    fetchReactions();
  }, [formData.action_service_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/automations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        navigate(`/services/${formData.trigger_service_id}`);
      } else {
        const errorData = await response.json();
        console.error('Error creating automation:', errorData);
        alert('Error creating automation. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating automation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAutomation = async (automationId: number) => {
    const automation = automations.find(a => a.id === automationId);
    if (!automation) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the automation "${automation.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingAutomations(prev => ({ ...prev, [automationId]: true }));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/automations/${automationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setAutomations(prev => prev.filter(a => a.id !== automationId));
      } else {
        alert('Failed to delete automation');
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
      alert('Failed to delete automation');
    } finally {
      setDeletingAutomations(prev => ({ ...prev, [automationId]: false }));
    }
  };

  const getTriggerService = () => services.find(s => s.id.toString() === formData.trigger_service_id);
  const getActionService = () => services.find(s => s.id.toString() === formData.action_service_id);

  if (loading) {
    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
    }

    return (
      <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      </main>
    );
}
