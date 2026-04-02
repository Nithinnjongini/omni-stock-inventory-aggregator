import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SearchResponse } from '../types';

const API_BASE = '/api/search';

async function fetchInventory(query: string, zipCode: string): Promise<SearchResponse> {
  const { data } = await axios.get<SearchResponse>(API_BASE, {
    params: { query, zipCode },
  });
  return data;
}

export function useInventorySearch(query: string, zipCode: string) {
  return useQuery<SearchResponse>({
    queryKey: ['inventory', query, zipCode],
    queryFn: () => fetchInventory(query, zipCode),
    enabled: query.length > 0 && zipCode.length === 5,
    staleTime: 900000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
