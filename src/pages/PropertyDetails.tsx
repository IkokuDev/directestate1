import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, ShieldCheck, Calendar, MessageSquare, CreditCard, CheckCircle2, ChevronLeft } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';

export default function PropertyDetails() {
  const { id } = useParams();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading property details...</div>;
  }

  if (!property) {
    return <div className="text-center py-20 text-gray-500">Property not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to listings
      </Link>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
        <div className="md:col-span-2 h-full">
          <img src={property.images?.[0] || 'https://picsum.photos/seed/placeholder/1200/600'} alt="Main" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="hidden md:flex flex-col gap-4 h-full">
          <img src={property.images?.[1] || 'https://picsum.photos/seed/placeholder2/600/400'} alt="Interior 1" className="w-full h-1/2 object-cover rounded-tr-2xl" referrerPolicy="no-referrer" />
          <img src={property.images?.[2] || 'https://picsum.photos/seed/placeholder3/600/400'} alt="Interior 2" className="w-full h-1/2 object-cover rounded-br-2xl" referrerPolicy="no-referrer" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="default" className="text-sm px-3 py-1">{property.type}</Badge>
              {property.verified && (
                <Badge variant="success" className="text-sm px-3 py-1 gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Verified Title
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{property.title}</h1>
            <div className="flex items-center text-gray-500 text-lg gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {property.location}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 py-6 border-y border-gray-200">
            {property.beds > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl"><Bed className="w-6 h-6 text-gray-700" /></div>
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-semibold text-gray-900">{property.beds}</p>
                </div>
              </div>
            )}
            {property.baths > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl"><Bath className="w-6 h-6 text-gray-700" /></div>
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-semibold text-gray-900">{property.baths}</p>
                </div>
              </div>
            )}
            {property.sqft > 0 && (
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl"><Square className="w-6 h-6 text-gray-700" /></div>
                <div>
                  <p className="text-sm text-gray-500">Square Feet</p>
                  <p className="font-semibold text-gray-900">{property.sqft}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">{property.description}</p>
          </div>

          {/* Verification Details */}
          {property.verified && (
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" /> Trust & Verification
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-green-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <span><strong>Title Documents Verified:</strong> Certificate of Occupancy (C of O) has been authenticated by our legal team.</span>
                </li>
                <li className="flex items-start gap-3 text-green-800">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <span><strong>Owner ID Verified:</strong> Government-issued ID matches property records.</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar / Action Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg border-gray-200">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Asking Price</p>
                <h2 className="text-4xl font-bold text-gray-900">₦{property.price?.toLocaleString()}</h2>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <Button className="w-full h-12 text-base gap-2" onClick={() => setShowPaymentModal(true)}>
                  <CreditCard className="w-5 h-5" /> Initiate Escrow Payment
                </Button>
                <Link to={`/messages?ownerId=${property.ownerId}&propertyId=${property.id}&ownerName=${encodeURIComponent(property.ownerName)}&propertyTitle=${encodeURIComponent(property.title)}`}>
                  <Button variant="outline" className="w-full h-12 text-base gap-2">
                    <MessageSquare className="w-5 h-5" /> Message Owner
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full h-12 text-base gap-2">
                  <Calendar className="w-5 h-5" /> Schedule Inspection
                </Button>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${property.ownerId}`} alt="Owner" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Listed by Owner</p>
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-gray-900">{property.ownerName}</p>
                      {property.ownerVerified && <ShieldCheck className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simple Payment Modal Simulation */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Secure Escrow Payment</h3>
                <p className="text-gray-500 text-sm">
                  Your funds will be held securely in escrow and only released to the owner after you confirm satisfaction.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Property</span>
                  <span className="font-medium text-gray-900">{property.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-900">₦{property.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Escrow Fee (1%)</span>
                  <span className="font-medium text-gray-900">₦{(property.price * 0.01).toLocaleString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">₦{(property.price * 1.01).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowPaymentModal(false)}>
                  Pay with Paystack
                </Button>
                <Button variant="ghost" className="w-full h-12" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
