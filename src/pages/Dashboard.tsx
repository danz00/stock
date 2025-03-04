import React, { useEffect } from 'react';
import { useProductsStore } from '../store/products';
import { useMovementsStore } from '../store/movements';
import { useEquipmentStore } from '../store/equipment';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Package,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Tag,
  Cpu,
} from 'lucide-react';

function Dashboard() {
  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const movements = useMovementsStore((state) => state.movements);
  const fetchMovements = useMovementsStore((state) => state.fetchMovements);
  const equipmentMovements = useEquipmentStore((state) => state.movements);
  const fetchEquipmentMovements = useEquipmentStore((state) => state.fetchMovements);
  const equipment = useEquipmentStore((state) => state.equipment);
  const fetchEquipment = useEquipmentStore((state) => state.fetchEquipment);

  useEffect(() => {
    fetchProducts();
    fetchMovements();
    fetchEquipmentMovements();
    fetchEquipment();
  }, [fetchProducts, fetchMovements, fetchEquipmentMovements, fetchEquipment]);

  // Agrupar produtos por marca
  const brandStats = products.reduce((acc, product) => {
    const brand = product.brand || 'Sem marca';
    if (!acc[brand]) {
      acc[brand] = 0;
    }
    acc[brand]++;
    return acc;
  }, {} as Record<string, number>);

  // Calcular saídas de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOutMovements = equipmentMovements.filter(m => {
    const movementDate = new Date(m.date);
    movementDate.setHours(0, 0, 0, 0);
    return m.type === 'OUT' && movementDate.getTime() === today.getTime();
  });

  // Estatísticas gerais
  const stats = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.quantity < 10).length,
    
    todayOutCount: todayOutMovements.length,
  };


  // Obter movimentações recentes de equipamentos
  const recentEquipmentMovements = equipmentMovements
    .slice(0, 5)
    .map(movement => {
      const equipmentItem = equipment.find(e => e.id === movement.equipmentId);
      const product = equipmentItem ? products.find(p => p.id === equipmentItem.productId) : null;
      
      return {
        ...movement,
        equipmentInfo: equipmentItem,
        productInfo: product,
      };
    });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Produtos
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalProducts}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Saídas Hoje
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.todayOutCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Cpu className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Equipamentos
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {equipment.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Produtos Recentes
          </h3>
          <div className="mt-5">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marca/Modelo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantidade
                          </th>
                          
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.slice(0, 5).map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.brand} {product.model}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.quantity}
                            </td>
                            
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              Nenhum produto cadastrado
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Produtos por Marca
            </h3>
            <div className="mt-5">
              <ul className="divide-y divide-gray-200">
                {Object.entries(brandStats).map(([brand, count]) => (
                  <li key={brand} className="py-4 flex justify-between">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{brand}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {count}
                    </span>
                  </li>
                ))}
                {Object.keys(brandStats).length === 0 && (
                  <li className="py-4 text-center text-gray-500">
                    Nenhuma marca cadastrada
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Movimentações Recentes
            </h3>
            <div className="mt-5">
              <ul className="divide-y divide-gray-200">
                {recentEquipmentMovements.map((movement) => (
                  <li key={movement.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {movement.productInfo?.imageUrl ? (
                          <img
                            src={movement.productInfo.imageUrl}
                            alt={movement.productInfo.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Cpu className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {movement.productInfo?.name || 'Produto desconhecido'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movement.equipmentInfo?.customer || 'Cliente não especificado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(movement.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            movement.type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {movement.type === 'IN' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
                {recentEquipmentMovements.length === 0 && (
                  <li className="py-4 text-center text-gray-500">
                    Nenhuma movimentação recente
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}

export default Dashboard;