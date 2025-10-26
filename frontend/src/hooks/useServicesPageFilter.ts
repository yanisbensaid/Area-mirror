import { useMemo } from 'react';
import type { Service, AREATemplate } from '../services/servicesPageService';

interface UseServicesPageFilterProps {
  services: Service[];
  areaTemplates: AREATemplate[];
  searchQuery: string;
  selectedCategory: string;
  showPopularOnly: boolean;
  currentPage: number;
  itemsPerPage: number;
}

interface FilteredItem extends Service {
  type?: never;
}

interface FilteredArea extends AREATemplate {
  type: 'area';
}

type FilteredItems = (FilteredItem | FilteredArea)[];

export const useServicesPageFilter = ({
  services,
  areaTemplates,
  searchQuery,
  selectedCategory,
  showPopularOnly,
  currentPage,
  itemsPerPage = 9,
}: UseServicesPageFilterProps) => {
  // Get unique categories
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(services.map(service => service.category)))];
  }, [services]);

  // Filter services based on criteria
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      const matchesSearch = !searchQuery ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPopular = !showPopularOnly || service.isPopular;

      return matchesCategory && matchesSearch && matchesPopular;
    });
  }, [services, selectedCategory, searchQuery, showPopularOnly]);

  // Filter AREA templates based on search criteria
  const filteredAreas = useMemo(() => {
    return areaTemplates.filter(area => {
      const matchesSearch = !searchQuery ||
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.action_service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.reaction_service.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [areaTemplates, searchQuery]);

  // Combine services and areas for display
  const allItems: FilteredItems = useMemo(() => {
    return [
      ...filteredServices,
      ...filteredAreas.map(area => ({
        ...area,
        type: 'area' as const
      }))
    ];
  }, [filteredServices, filteredAreas]);

  // Pagination calculations
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = allItems.slice(startIndex, endIndex);

    return {
      totalPages,
      startIndex,
      endIndex,
      currentItems,
      hasResults: allItems.length > 0,
      totalItems: allItems.length,
    };
  }, [allItems, currentPage, itemsPerPage]);

  return {
    categories,
    filteredServices,
    filteredAreas,
    allItems,
    ...pagination,
  };
};
