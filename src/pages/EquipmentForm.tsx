import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEquipmentStore } from '../store/equipment';
import { useProductsStore } from '../store/products';
import { ArrowLeft } from 'lucide-react';

const equipmentSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  macAddress: z.string().min(1, 'MAC Address é obrigatório'),
  gponSn: z.string().min(1, 'GPON SN é obrigatório'),
  customer: z.string().min(1, 'Cliente é obrigatório'),
  description: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

function EquipmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const equipment = useEquipmentStore((state) => state.equipment);
  const addEquipment = useEquipmentStore((state) => state.addEquipment);
  const updateEquipment = useEquipmentStore((state) => state.updateEquipment);
  const fetchEquipment = useEquipmentStore((state) => state.fetchEquipment);
  
  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchEquipment();
    fetchProducts();
  }, [fetchEquipment, fetchProducts]);

  const equipmentItem = id ? equipment.find((e) => e.id === id) : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: equipmentItem
      ? {
          productId: equipmentItem.productId,
          macAddress: equipmentItem.macAddress,
          gponSn: equipmentItem.gponSn,
          customer: equipmentItem.customer,
          description: equipmentItem.description,
        }
      : undefined,
  });

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      if (id) {
        updateEquipment(id, data);
      } else {
        addEquipment(data);
      }
      navigate('/equipment');
    } catch (error) {
      console.error('Falha ao salvar equipamento:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/equipment')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Voltar
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">
          {id ? 'Editar Equipamento' : 'Adicionar Equipamento'}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="productId"
                className="block text-sm font-medium text-gray-700"
              >
                Produto
              </label>
              <select
                {...register('productId')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} {product.brand} {product.model}
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="macAddress"
                className="block text-sm font-medium text-gray-700"
              >
                MAC Address
              </label>
              <input
                type="text"
                {...register('macAddress')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="00:1A:2B:3C:4D:5E"
              />
              {errors.macAddress && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.macAddress.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="gponSn"
                className="block text-sm font-medium text-gray-700"
              >
                GPON SN
              </label>
              <input
                type="text"
                {...register('gponSn')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="00:1A:2B:3C:4D:5E"
              />
              {errors.gponSn && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.gponSn.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="customer"
                className="block text-sm font-medium text-gray-700"
              >
                Cliente
              </label>
              <input
                type="text"
                {...register('customer')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.customer && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customer.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descrição
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/equipment')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Equipamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EquipmentForm;