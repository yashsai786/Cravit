import React from 'react';
import ProductCard from '@/components/instamart/ProductCard';
const products = [{ id: 1, name: 'Milk' }, { id: 2, name: 'Bread' }];

const InstamartPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Instamart</h1>
      <div className="grid grid-cols-2 gap-4">
        {products.map(product => (
          <div key={product.id}>
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstamartPage;
