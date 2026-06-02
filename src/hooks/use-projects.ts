'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR('projects', fetchProjects, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  })

  return {
    projects: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
