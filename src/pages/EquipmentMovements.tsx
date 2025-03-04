import React, { useState, useEffect } from 'react';
import { useEquipmentStore } from '../store/equipment';
import { useProductsStore } from '../store/products';
import { useAuthStore } from '../store/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, Cpu } from 'lucide-react';

function EquipmentMovements() {
  const equipment = useEquipmentStore((state) => state.equipment);
  const movements = useEquipmentStore((state) => state.movements);
  const addMovement = useEquipmentStore((state) => state.addMovement);
  const fetchEquipment = useEquipmentStore((state) => state.fetchEquipment);
  const fetchMovements = useEquipmentStore((state) => state.fetchMovements);
  
  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  
  const user = useAuthStore((state) => state.user);

  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEquipment();
    fetchProducts();
    fetchMovements();
  }, [fetchEquipment, fetchProducts, fetchMovements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const equipmentItem = equipment.find(e => e.id === selectedEquipment);
    if (!equipmentItem) {
      setError('Por favor, selecione um equipamento');
      return;
    }

    // Verificar se o status atual é compatível com o movimento
    if (type === 'OUT' && equipmentItem.status === 'DEPLOYED') {
      setError('Este equipamento já está implantado');
      return;
    }

    if (type === 'IN' && equipmentItem.status === 'IN_STOCK') {
      setError('Este equipamento já está em estoque');
      return;
    }

    addMovement({
      equipmentId: selectedEquipment,
      type,
      userId: user?.id || '',
      notes: notes || undefined,
    });

    setSelectedEquipment('');
    setType('OUT');
    setNotes('');
  };

  // Filtrar equipamentos disponíveis com base no tipo de movimento
  const availableEquipment = equipment.filter(e => 
    (type === 'OUT' && e.status === 'IN_STOCK') || 
    (type === 'IN' && e.status === 'DEPLOYED')
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Movimentação de Equipamentos</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Registrar Movimentação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Movimentação
              </label>
              <div className="mt-1 flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="OUT"
                    checked={type === 'OUT'}
                    onChange={(e) => setType(e.target.value as 'OUT')}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Saída</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="IN"
                    checked={type === 'IN'}
                    onChange={(e) => setType(e.target.value as 'IN')}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Entrada</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Equipamento
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Selecione um equipamento</option>
                {availableEquipment.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <option key={item.id} value={item.id}>
                      {product?.name || 'Produto desconhecido'} - {item.macAddress} ({item.customer})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Informações adicionais sobre a movimentação"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Registrar Movimentação
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Movimentações Recentes</h2>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {movements.slice(0, 10).map((movement) => {
                const equipmentItem = equipment.find(e => e.id === movement.equipmentId);
                const product = equipmentItem ? products.find(p => p.id === equipmentItem.productId) : null;
                return (
                  <li key={movement.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {product?.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Cpu className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product?.name || 'Produto desconhecido'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {equipmentItem?.macAddress} - {equipmentItem?.customer}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(movement.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {movement.type === 'IN' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'IN' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </div>
                    {movement.notes && (
                      <div className="mt-2 ml-12 text-sm text-gray-600">
                        <p>{movement.notes}</p>
                      </div>
                    )}
                  </li>
                );
              })}
              {movements.length === 0 && (
                <li className="py-4 text-center text-gray-500">
                  Nenhuma movimentação registrada
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquipmentMovements;