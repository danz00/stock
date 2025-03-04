import React, { useEffect, useMemo, useState } from 'react';
import { useProductsStore } from '../store/products';
import { useMovementsStore } from '../store/movements';
import { format } from 'date-fns';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Package,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

function Reports() {
  const products = useProductsStore((state) => state.products);
  const productsLoading = useProductsStore((state) => state.loading);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const movements = useMovementsStore((state) => state.movements);
  const movementsLoading = useMovementsStore((state) => state.loading);
  const fetchMovements = useMovementsStore((state) => state.fetchMovements);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, [fetchProducts, fetchMovements]);

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(products.map((p) => p.category))];
    return cats.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const stats = useMemo(() => {
    const lowStockThreshold = 10;
    return {
      totalProducts: filteredProducts.length,
      
      lowStock: filteredProducts.filter((p) => p.quantity < lowStockThreshold).length,
      outOfStock: filteredProducts.filter((p) => p.quantity === 0).length,
      
    };
  }, [filteredProducts]);

  const movementStats = useMemo(() => {
    const categoryMovements = movements.filter(
      (m) =>
        selectedCategory === 'all' ||
        products.find((p) => p.id === m.productId)?.category === selectedCategory
    );

    const inMovements = categoryMovements.filter((m) => m.type === 'IN');
    const outMovements = categoryMovements.filter((m) => m.type === 'OUT');

    return {
      totalMovements: categoryMovements.length,
      inQuantity: inMovements.reduce((acc, m) => acc + m.quantity, 0),
      outQuantity: outMovements.reduce((acc, m) => acc + m.quantity, 0),
      lastMovements: categoryMovements.slice(0, 5),
    };
  }, [movements, products, selectedCategory]);

  if (productsLoading || movementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando relatório...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Relatório de estoque</h1>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all'
                ? 'All Categories'
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

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
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Estoque baixo
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.lowStock}
                    </div>
                    <p className="ml-2 text-sm text-gray-500">
                      ({stats.outOfStock} fora de estoque)
                    </p>
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
                <BarChart3 className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Value
                  </dt>
                  
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  
                  
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Movimentação geral
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-700">
                      Entrada
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-green-900">
                    {movementStats.inQuantity}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium text-red-700">
                      Saída
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-red-900">
                    {movementStats.outQuantity}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Movimentações recentes
            </h2>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
              {movementStats.lastMovements.map((movement) => {
  const product = products.find((p) => p.id === movement.productId);
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
              <Package className="h-4 w-4 text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {product?.name}
          </p>
          <p className="text-sm text-gray-500">
            {format(movement.date, 'PPp')}
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
            {movement.type === 'IN' ? '+' : '-'}
            {movement.quantity}
          </span>
        </div>
      </div>
    </li>
  );
})}
                {movementStats.lastMovements.length === 0 && (
                  <li className="py-4 text-center text-gray-500">
                    Sem movimentações recentes
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Produtos com estoque baixo
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
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
                {filteredProducts
                  .filter((p) => p.quantity < 10)
                  .map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            product.quantity === 0
                              ? 'text-red-600 font-bold'
                              : 'text-yellow-600'
                          }`}
                        >
                          {product.quantity}
                        </span>
                      </td>
                     
                    </tr>
                  ))}
                {filteredProducts.filter((p) => p.quantity < 10).length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Produtos com estoque baixo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;