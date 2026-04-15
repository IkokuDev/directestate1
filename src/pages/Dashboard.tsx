import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, PieChart, Activity, DollarSign, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { useAuth } from '@/src/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Link } from 'react-router-dom';

const priceData = [
  { month: 'Jan', price: 400000000 },
  { month: 'Feb', price: 410000000 },
  { month: 'Mar', price: 405000000 },
  { month: 'Apr', price: 420000000 },
  { month: 'May', price: 435000000 },
  { month: 'Jun', price: 450000000 },
];

const yieldData = [
  { location: 'Lekki', yield: 6.5 },
  { location: 'Ikoyi', yield: 5.2 },
  { location: 'VI', yield: 5.8 },
  { location: 'Ikeja', yield: 7.1 },
  { location: 'Yaba', yield: 8.4 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'properties'), where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const properties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyProperties(properties);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, [user]);

  const portfolioValue = myProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

  if (!user) {
    return <div className="text-center py-20 text-gray-500">Please sign in to view your dashboard.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics & Portfolio</h1>
        <p className="text-gray-500 mt-1">Track market trends and your property listings.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Market Trend</p>
              <h3 className="text-2xl font-bold text-gray-900">+12.5%</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Rental Yield</p>
              <h3 className="text-2xl font-bold text-gray-900">6.8%</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Your Properties</p>
              <h3 className="text-2xl font-bold text-gray-900">{myProperties.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Portfolio Value</p>
              <h3 className="text-2xl font-bold text-gray-900">₦{portfolioValue.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Property Price Trends</CardTitle>
            <CardDescription>Average property prices over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `₦${value/1000000}m`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Avg Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rental Yield Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Estimated Rental Yields</CardTitle>
            <CardDescription>Average ROI percentage by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="location" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value}%`, 'Yield']}
                  />
                  <Bar dataKey="yield" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Properties */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Properties</h2>
        <Card>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading your properties...</div>
            ) : myProperties.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                You haven't listed any properties yet.
                <div className="mt-4">
                  <Link to="/add-property" className="text-blue-600 hover:underline font-medium">
                    List a Property
                  </Link>
                </div>
              </div>
            ) : (
              myProperties.map((property) => (
                <Link key={property.id} to={`/property/${property.id}`} className="block hover:bg-gray-50 transition-colors">
                  <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                        <img src={property.images?.[0] || `https://picsum.photos/seed/${property.id}/200/200`} alt={property.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-500">{property.location} • {property.type}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-gray-900">₦{property.price?.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Listed on {new Date(property.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

