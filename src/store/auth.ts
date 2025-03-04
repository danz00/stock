import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  register: (username: string, password: string, name: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (username: string, password: string, name: string, role: 'ADMIN' | 'OPERATOR') => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  fetchUsers: () => Promise<User[]>;
  users: User[];
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      users: [],

      register: async (username: string, password: string, name: string) => {
        set({ loading: true, error: null });
        try {
          // Using username as email with a fake domain to work with Supabase auth
          const email = `${username}@inventory.local`;
          
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) throw signUpError;
          if (!authData.user) throw new Error('Falha no registro');

          // Create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                username,
                email,
                name,
                role: 'OPERATOR',
              },
            ]);

          if (profileError) throw profileError;

          set({
            user: {
              id: authData.user.id,
              username,
              name,
              role: 'ADMIN',
            },
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      login: async (username: string, password: string) => {
        set({ loading: true, error: null });
        try {
          // Using username as email with a fake domain to work with Supabase auth
          const email = `${username}@inventory.local`;

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;
          if (!data.user) throw new Error('Nenhum dado de usuário retornado');

          // Get user profile
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError) throw userError;

          set({
            user: {
              id: userData.id,
              username: userData.username || username,
              name: userData.name,
              role: userData.role,
            },
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, isAuthenticated: false, loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      createUser: async (username: string, password: string, name: string, role: 'ADMIN' | 'OPERATOR') => {
        set({ loading: true, error: null });
        try {
          const email = `${username}@inventory.local`;
          
          // Create auth user
          const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

          if (signUpError) throw signUpError;
          if (!authData.user) throw new Error('Falha ao criar usuário');

          // Create user profile
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: authData.user.id,
                username,
                email,
                name,
                role,
              },
            ]);

          if (profileError) throw profileError;

          // Refresh users list
          await get().fetchUsers();
          
          set({ loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      deleteUser: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          // Delete user from auth
          const { error: authError } = await supabase.auth.admin.deleteUser(userId);
          if (authError) throw authError;

          // Delete user profile
          const { error: profileError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

          if (profileError) throw profileError;

          // Refresh users list
          await get().fetchUsers();
          
          set({ loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      updateUser: async (userId: string, data: Partial<User>) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase
            .from('users')
            .update({
              name: data.name,
              role: data.role,
            })
            .eq('id', userId);

          if (error) throw error;

          // Refresh users list
          await get().fetchUsers();
          
          set({ loading: false });
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },

      fetchUsers: async () => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*');

          if (error) throw error;

          const users = data.map(user => ({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role as 'ADMIN' | 'OPERATOR',
          }));

          set({ users, loading: false });
          return users;
        } catch (error) {
          set({ error: (error as Error).message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);