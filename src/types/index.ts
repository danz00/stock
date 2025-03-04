export type Product = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  category: string;
  
  brand?: string;
  model?: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Movement = {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: Date;
  userId: string;
};

export type User = {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'OPERATOR';
};

export type Category = {
  id: string;
  name: string;
  createdAt: Date;
};

export type Equipment = {
  id: string;
  productId: string;
  macAddress: string;
  gponSn: string;
  costumer: string;
  description: string;
  status: 'IN_STOCK' | 'DEPLOYED';
  createdAt: Date;
  updatedAt: Date;
};

export type EquipmentMovement = {
  id: string;
  equipmentId: string;
  type: 'IN' | 'OUT';
  date: Date;
  userId: string;
  notes?: string;
};