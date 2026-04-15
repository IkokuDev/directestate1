import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, ShieldCheck, Bed, Bath, Square } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardFooter } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/firebase';

export default function Home() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const propsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProperties(propsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching properties", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProperties = properties.filter(p => 
    (activeTab === 'All' || p.type === activeTab) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Hero Search Section */}
      <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
          Find your next <span className="text-blue-600">property</span> directly.
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Connect directly with owners. Verified listings, secure escrow payments, and zero unnecessary middleman fees.
        </p>

        <div className="max-w-3xl mx-auto bg-gray-50 p-2 rounded-2xl flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input 
              placeholder="Search location or property..." 
              className="pl-10 h-12 bg-white border-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 bg-white border-none shadow-sm gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
          <Button className="h-12 px-8 text-base">
            Search
          </Button>
        </div>

        {/* Smart Search Tabs */}
        <div className="flex justify-center gap-2 pt-4">
          {['All', 'Rent', 'Buy', 'Invest'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              className="rounded-full px-6"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </section>

      {/* Listings Grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verified Properties</h2>
            <p className="text-gray-500">Direct from owners, verified by our team.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading properties...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Link key={property.id} to={`/property/${property.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-all group cursor-pointer border-gray-200">
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={property.images?.[0] || 'https://picsum.photos/seed/placeholder/800/600'} 
                      alt={property.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge variant="default" className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur-sm">
                        {property.type}
                      </Badge>
                      {property.verified && (
                        <Badge variant="success" className="bg-green-500/90 text-white hover:bg-green-500 backdrop-blur-sm gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge variant="secondary" className="bg-gray-900/80 text-white hover:bg-gray-900 backdrop-blur-sm">
                        ₦{property.price?.toLocaleString()}{property.type === 'Rent' ? '/yr' : ''}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1 gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {property.location}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                      {property.beds > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-gray-400" />
                          <span>{property.beds} Beds</span>
                        </div>
                      )}
                      {property.baths > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-gray-400" />
                          <span>{property.baths} Baths</span>
                        </div>
                      )}
                      {property.sqft > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Square className="w-4 h-4 text-gray-400" />
                          <span>{property.sqft} sqft</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No properties found matching your criteria.
          </div>
        )}
      </section>
    </div>
  );
}
