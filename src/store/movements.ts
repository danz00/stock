import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Movement } from '../types';

type MovementsState = {
  movements: Movement[];
  loading: boolean;
  error: string | null;
  fetchMovements: () => Promise<void>;
  addMovement: (movement: Omit<Movement, 'id' | 'date'>) => Promise<void>;
};

export const useMovementsStore = create<MovementsState>((set) => ({
  movements: [],
  loading: false,
  error: null,

  fetchMovements: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      set({
        movements: data.map(movement => ({
          ...movement,
          date: new Date(movement.date),
        })),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addMovement: async (movement) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('movements')
        .insert([{
          product_id: movement.productId,
          type: movement.type,
          quantity: movement.quantity,
          user_id: movement.userId,
        }])
        .select()
        .single();

      if (error) throw error;

      const newMovement = {
        ...data,
        productId: data.product_id,
        userId: data.user_id,
        date: new Date(data.date),
      };

      set(state => ({
        movements: [newMovement, ...state.movements],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));