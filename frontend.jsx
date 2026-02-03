'use client';

import { useState, useEffect } from 'react';
import { Search, Camera, Loader2, Star, MapPin, Package, Clock, Crown, ExternalLink, Heart, Share2, Filter } from 'lucide-react';

export default function SourcingPlatform() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ minRating: 0, maxPrice: 1000, goldOnly: false });
  const [selectedProduct, setSelectedProduct] = useState(null);

  // API Configuration - Keys go in .env.local, accessed via process.env
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Real API call to your backend
      const response = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&gold=${filters.goldOnly}&maxPrice=${filters.maxPrice}`);
      const data = await response.json();
      setResults(data.products || []);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE}/api/search/image`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data.products || []);
      setQuery('Image Search: ' + file.name);
    } catch (error) {
      console.error('Image search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white p-2 rounded-lg">
              <Package size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900">SourcePro</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              System Online
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Search Section */}
      <div className="bg-white border-b border-slate-200 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-8">
            Find Alibaba Suppliers Instantly
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-white border-2 border-slate-200 rounded-2xl shadow-lg focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
              <Search className="ml-4 text-slate-400" size={24} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, paste Amazon URL, or describe what you need..."
                className="flex-1 px-4 py-4 text-lg outline-none bg-transparent"
              />
              
              <label className="cursor-pointer p-2 hover:bg-slate-100 rounded-xl transition mr-2">
                <Camera className="text-slate-500" size={24} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageSearch}
                />
              </label>
              
              <button 
                type="submit"
                disabled={loading}
                className="m-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-semibold transition flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
              </button>
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-4 justify-center flex-wrap">
            <button 
              onClick={() => setFilters({...filters, goldOnly: !filters.goldOnly})}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                filters.goldOnly ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-slate-100 text-slate-600 border-slate-200'
              } border`}
            >
              <Crown size={14} /> Gold Suppliers Only
            </button>
            <select 
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
              className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200 outline-none"
            >
              <option value={1000}>Any Price</option>
              <option value={5}>Under $5</option>
              <option value={10}>Under $10</option>
              <option value={50}>Under $50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {results.length > 0 && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-slate-600">
              Found <span className="font-bold text-slate-900">{results.length}</span> verified suppliers
            </p>
            <div className="flex gap-2 text-sm">
              <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white">
                <Filter size={14} /> Sort by Match
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>

        {results.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to Source</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Enter any product name above to search our database of 200,000+ Alibaba suppliers
            </p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          apiBase={API_BASE}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const matchColor = product.matchScore >= 95 ? 'bg-green-500' : 
                     product.matchScore >= 85 ? 'bg-orange-500' : 'bg-yellow-500';

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-3 left-3 ${matchColor} text-white px-3 py-1 rounded-full text-xs font-bold`}>
          {product.matchScore}% Match
        </div>
        {product.isGold && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Crown size={12} /> GOLD
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
          <MapPin size={14} />
          <span className="truncate">{product.supplierName}</span>
        </div>
        
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-slate-900">${product.price}</div>
            <div className="text-xs text-slate-500">Min: {product.moq} units</div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="fill-yellow-400 text-yellow-400" size={16} />
            <span className="font-medium">{product.rating}</span>
            <span className="text-slate-400">({product.reviews})</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition">
            Contact Supplier
          </button>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Heart size={20} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, apiBase }) {
  const [contactForm, setContactForm] = useState({ name: '', email: '', quantity: product.moq, message: '' });
  const [sending, setSending] = useState(false);

  const handleContact = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await fetch(`${apiBase}/api/contact-supplier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, supplierId: product.supplierId, productId: product.id })
      });
      alert('Message sent to supplier!');
      onClose();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Supplier Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div>
            <img src={product.image} alt={product.name} className="w-full rounded-xl mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Price Range</span>
                <span className="font-semibold">${product.price} - ${product.maxPrice}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Minimum Order</span>
                <span className="font-semibold">{product.moq} pieces</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Response Time</span>
                <span className="font-semibold flex items-center gap-1">
                  <Clock size={14} /> {product.responseTime}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Supplier</h3>
            <form onSubmit={handleContact} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-orange-500"
                value={contactForm.name}
                onChange={e => setContactForm({...contactForm, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Business Email"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-orange-500"
                value={contactForm.email}
                onChange={e => setContactForm({...contactForm, email: e.target.value})}
              />
              <input
                type="number"
                placeholder="Quantity Needed"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-orange-500"
                value={contactForm.quantity}
                onChange={e => setContactForm({...contactForm, quantity: e.target.value})}
              />
              <textarea
                placeholder="Message to supplier..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-orange-500 resize-none"
                value={contactForm.message}
                onChange={e => setContactForm({...contactForm, message: e.target.value})}
                defaultValue={`Hi, I'm interested in ${product.name}. Please send best price for ${product.moq} units.`}
              />
              <button 
                type="submit" 
                disabled={sending}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:bg-slate-300 transition"
              >
                {sending ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
