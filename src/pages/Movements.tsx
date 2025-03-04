import React, { useState } from 'react';
import { useMovementsStore } from '../store/movements';
import { useProductsStore } from '../store/products';
import { useAuthStore } from '../store/auth';
import { format } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Package } from 'lucide-react';

function Movements() {
  const movements = useMovementsStore((state) => state.movements);
  const addMovement = useMovementsStore((state) => state.addMovement);
  const products = useProductsStore((state) => state.products);
  const user = useAuthStore((state) => state.user);

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      setError('Please select a product');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (type === 'OUT' && qty > product.quantity) {
      setError('Insufficient stock');
      return;
    }

    addMovement({
      productId: selectedProduct,
      type,
      quantity: qty,
      userId: user?.id || '',
    });

    setSelectedProduct('');
    setQuantity('');
    setType('IN');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Inventory Movements</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Record Movement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Current Stock: {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Movement Type
              </label>
              <div className="mt-1 flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="IN"
                    checked={type === 'IN'}
                    onChange={(e) => setType(e.target.value as 'IN')}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Stock In</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="OUT"
                    checked={type === 'OUT'}
                    onChange={(e) => setType(e.target.value as 'OUT')}
                    className="form-radio h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">Stock Out</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Record Movement
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Movements</h2>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {movements.slice().reverse().map((movement) => {
                const product = products.find(p => p.id === movement.productId);
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
                      <div className="flex items-center">
                        {movement.type === 'IN' ? (
                          <ArrowUpCircle className="h-5 w-5 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
              {movements.length === 0 && (
                <li className="py-4 text-center text-gray-500">
                  No movements recorded
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Movements;