'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function TestGravImagesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/shop/products?category=glass&limit=50')
      .then(res => res.json())
      .then(data => {
        const gravProducts = data.products.filter((p: any) => 
          p.brand === 'GRAV'
        ).slice(0, 10);
        setProducts(gravProducts);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">GRAV Products Image Test</h1>
      <p className="mb-4">Found {products.length} GRAV products</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product: any) => (
          <div key={product.id} className="border p-4">
            <div className="relative w-full h-48 bg-gray-100 mb-2">
              <Image
                src={product.image || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-contain"
                onError={(e) => {
                  console.error('Image failed:', product.image);
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
                onLoad={() => {
                  console.log('Image loaded:', product.name);
                }}
              />
            </div>
            <p className="text-xs font-bold truncate">{product.name}</p>
            <p className="text-xs text-gray-600 truncate">{product.image}</p>
            <p className="text-xs font-bold mt-1">${product.price}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Image URLs:</h2>
        <ul className="space-y-2">
          {products.map((p: any) => (
            <li key={p.id} className="text-xs break-all">
              {p.name}: <a href={p.image} target="_blank" className="text-blue-600 hover:underline">{p.image}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
