import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Equipment, EquipmentMovement } from '../types';

type EquipmentState = {
  equipment: Equipment[];
  movements: EquipmentMovement[];
  loading: boolean;
  error: string | null;
  fetchEquipment: () => Promise<void>;
  fetchMovements: () => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateEquipment: (id: string, equipment: Partial<Equipment>) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addMovement: (movement: Omit<EquipmentMovement, 'id' | 'date'>) => Promise<void>;
};

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  movements: [],
  loading: false,
  error: null,

  fetchEquipment: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        equipment: data.map(item => ({
          id: item.id,
          productId: item.product_id,
          macAddress: item.mac_address,
          gponSn: item.gpon_sn,
          customer: item.customer,
          description: item.description || '',
          status: item.status,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        })),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchMovements: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('equipment_movements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      set({
        movements: data.map(movement => ({
          id: movement.id,
          equipmentId: movement.equipment_id,
          type: movement.type,
          date: new Date(movement.date),
          userId: movement.user_id,
          notes: movement.notes || undefined,
        })),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addEquipment: async (equipment) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert([{
          product_id: equipment.productId,
          mac_address: equipment.macAddress,
          gpon_sn: equipment.gponSn,
          customer: equipment.customer,
          description: equipment.description,
        }])
        .select()
        .single();

      if (error) throw error;

      const newEquipment = {
        id: data.id,
        productId: data.product_id,
        macAddress: data.mac_address,
        gponSn: data.gpon_sn,
        customer: data.customer,
        description: data.description || '',
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set(state => ({
        equipment: [newEquipment, ...state.equipment],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateEquipment: async (id, equipment) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('equipment')
        .update({
          product_id: equipment.productId,
          mac_address: equipment.macAddress,
          gpon_sn: equipment.gponSn,
          customer: equipment.customer,
          description: equipment.description,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedEquipment = {
        id: data.id,
        productId: data.product_id,
        macAddress: data.mac_address,
        gponSn: data.gpon_sn,
        customer: data.customer,
        description: data.description || '',
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set(state => ({
        equipment: state.equipment.map(e => (e.id === id ? updatedEquipment : e)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteEquipment: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        equipment: state.equipment.filter(e => e.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addMovement: async (movement) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('equipment_movements')
        .insert([{
          equipment_id: movement.equipmentId,
          type: movement.type,
          user_id: movement.userId,
          notes: movement.notes,
        }])
        .select()
        .single();

      if (error) throw error;

      const newMovement = {
        id: data.id,
        equipmentId: data.equipment_id,
        type: data.type,
        date: new Date(data.date),
        userId: data.user_id,
        notes: data.notes || undefined,
      };

      // Update equipment status in local state
      await get().fetchEquipment();

      set(state => ({
        movements: [newMovement, ...state.movements],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));