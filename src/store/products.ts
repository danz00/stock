import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';

type ProductsState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      set({
        products: data.map(product => ({
          ...product,
          imageUrl: product.image_url || '',
          brand: product.brand || '',
          model: product.model || '',
          createdAt: new Date(product.created_at),
          updatedAt: new Date(product.updated_at),
        })),
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },


  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          description: product.description,
          quantity: product.quantity,
          category: product.category,
          
          brand: product.brand || null,
          model: product.model || null,
          image_url: product.imageUrl || null,
        }])
        .select()
        .single();

      if (error) throw error;

      const newProduct = {
        ...data,
        imageUrl: data.image_url || '',
        brand: data.brand || '',
        model: data.model || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set(state => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  
  updateProduct: async (id, product) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          quantity: product.quantity,
          category: product.category,
          
          brand: product.brand || null,
          model: product.model || null,
          image_url: product.imageUrl || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct = {
        ...data,
        imageUrl: data.image_url || '',
        brand: data.brand || '',
        model: data.model || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      set(state => ({
        products: state.products.map(p => (p.id === id ? updatedProduct : p)),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        products: state.products.filter(p => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));