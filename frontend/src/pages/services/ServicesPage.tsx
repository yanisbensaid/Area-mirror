import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useServicesPage } from '../../contexts/ServicesPageContext';
import { useServicesPageFilter } from '../../hooks/useServicesPageFilter';
import ServiceCard from '../../components/services/ServiceCard';
import {
  ServicesPageHeader,
  ServicesPageStats,
  SearchAndFilters,
  PaginationControls,
  LoadingState,
  ErrorState,
  NoResultsState,
} from '../../components/services/servicesPage';
import type { Service, AREATemplate } from '../../services/servicesPageService';

const ServicesPageRefactored: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const {
    services,
    areaTemplates,
    loading,
    error,
    searchQuery,
    selectedCategory,
    showPopularOnly,
    currentPage,
    fetchServices,
    fetchAREATemplates,
    setSearchQuery,
    setSelectedCategory,
    setShowPopularOnly,
    setCurrentPage,
    clearFilters,
  } = useServicesPage();

  // Use filtering hook
  const {
    categories,
    currentItems,
    totalPages,
    hasResults,
    totalItems,
  } = useServicesPageFilter({
    services,
    areaTemplates,
    searchQuery,
    selectedCategory,
    showPopularOnly,
    currentPage,
    itemsPerPage: 9,
  });

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      await fetchServices();
      
      if (isLoggedIn) {
        const token = localStorage.getItem('token');
        await fetchAREATemplates(token || undefined);
      }
    };

    loadData();
  }, [fetchServices, fetchAREATemplates, isLoggedIn]);

  // Reset to page 1 if current page is beyond available pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  return (
    <main className="pt-16 md:pt-20 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto py-6 md:py-12">
        {/* Header */}
        <ServicesPageHeader
          title="All Services"
          description="Discover all available services and apps you can connect with AREA to create powerful automations"
        />

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Error State */}
        {error && <ErrorState error={error} />}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Stats */}
            <ServicesPageStats services={services} categories={categories} />

            {/* Search and Filters */}
            <SearchAndFilters
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              showPopularOnly={showPopularOnly}
              categories={categories}
              onSearchChange={setSearchQuery}
              onCategoryChange={setSelectedCategory}
              onPopularToggle={setShowPopularOnly}
              onClearFilters={clearFilters}
            />

            {/* Services and AREAs Grid */}
            <h2 className="sr-only">Available Services and Automations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {currentItems.map((item) => {
                if ('type' in item && item.type === 'area') {
                  // Render AREA card
                  const area = item as AREATemplate & { type: 'area' };
                  return (
                    <ServiceCard
                      key={area.id}
                      type="area"
                      id={area.id}
                      name={area.name}
                      description={area.description}
                      icons={[area.action_service.toLowerCase(), area.reaction_service.toLowerCase()]}
                      connectionStatus={area.services_connected}
                      isActive={area.can_activate}
                      href={`/area/${area.id}`}
                    />
                  );
                } else {
                  // Render regular service card
                  const service = item as Service;
                  return (
                    <ServiceCard
                      key={service.id}
                      type="service"
                      id={service.id}
                      name={service.name}
                      description={service.description}
                      icon={service.logo}
                      color={service.color}
                      category={service.category}
                      automationCount={service.automationCount}
                      isPopular={service.isPopular}
                      href={`/services/${service.id}`}
                    />
                  );
                }
              })}
            </div>

            {/* Pagination Controls */}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={9}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />

            {/* No results */}
            {!hasResults && !error && (
              <NoResultsState onClearFilters={clearFilters} />
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default ServicesPageRefactored;
