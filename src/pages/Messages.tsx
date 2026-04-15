import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { collection, query, where, or, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { useLocation } from 'react-router-dom';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch all messages where user is sender or receiver
    const q = query(
      collection(db, 'messages'),
      or(
        where('senderId', '==', user.uid),
        where('receiverId', '==', user.uid)
      ),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Group by contact
      const contactsMap = new Map();
      msgs.forEach(msg => {
        const contactId = msg.senderId === user.uid ? msg.receiverId : msg.senderId;
        if (!contactsMap.has(contactId)) {
          contactsMap.set(contactId, {
            id: contactId,
            name: `User ${contactId.substring(0, 5)}`, // Mock name, ideally fetch from users collection
            property: 'Property Inquiry',
            lastMessage: msg.text,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: msg.timestamp,
            unread: 0,
            online: false,
            messages: []
          });
        }
        const contact = contactsMap.get(contactId);
        contact.lastMessage = msg.text;
        contact.time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        contact.timestamp = msg.timestamp;
        contact.messages.push(msg);
      });

      // Handle query params for new chat
      const searchParams = new URLSearchParams(location.search);
      const newOwnerId = searchParams.get('ownerId');
      const newOwnerName = searchParams.get('ownerName');
      const newPropertyTitle = searchParams.get('propertyTitle');

      if (newOwnerId && newOwnerId !== user.uid && !contactsMap.has(newOwnerId)) {
        contactsMap.set(newOwnerId, {
          id: newOwnerId,
          name: newOwnerName || `User ${newOwnerId.substring(0, 5)}`,
          property: newPropertyTitle || 'Property Inquiry',
          lastMessage: 'Start a conversation...',
          time: 'Now',
          timestamp: Date.now(),
          unread: 0,
          online: true,
          messages: []
        });
      }

      const sortedContacts = Array.from(contactsMap.values()).sort((a, b) => b.timestamp - a.timestamp);
      setContacts(sortedContacts);

      if (activeContact) {
        const updatedActive = sortedContacts.find(c => c.id === activeContact.id);
        if (updatedActive) {
          setMessages(updatedActive.messages);
        }
      } else if (newOwnerId && newOwnerId !== user.uid) {
        const newContact = sortedContacts.find(c => c.id === newOwnerId);
        if (newContact) {
          setActiveContact(newContact);
          setMessages(newContact.messages);
        }
      } else if (sortedContacts.length > 0) {
        setActiveContact(sortedContacts[0]);
        setMessages(sortedContacts[0].messages);
      }
    });

    return () => unsubscribe();
  }, [user, activeContact?.id, location.search]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !user || !activeContact) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: user.uid,
        receiverId: activeContact.id,
        propertyId: 'general', // Ideally link to a specific property
        text: messageInput.trim(),
        timestamp: Date.now()
      });
      setMessageInput('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) {
    return <div className="text-center py-20 text-gray-500">Please sign in to view messages.</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-200 overflow-hidden flex shadow-sm">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search messages..." className="pl-9 bg-gray-100 border-transparent focus-visible:ring-1" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No messages yet.</div>
          ) : (
            contacts.map((contact) => (
              <div 
                key={contact.id}
                onClick={() => {
                  setActiveContact(contact);
                  setMessages(contact.messages);
                }}
                className={cn(
                  "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors flex gap-3",
                  activeContact?.id === contact.id ? "bg-blue-50 hover:bg-blue-50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${contact.id}`} alt={contact.name} referrerPolicy="no-referrer" />
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-semibold text-gray-900 truncate">{contact.name}</h4>
                    <span className="text-xs text-gray-500 shrink-0">{contact.time}</span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium truncate mb-1">{contact.property}</p>
                  <div className="flex justify-between items-center">
                    <p className={cn("text-sm truncate", contact.unread > 0 ? "text-gray-900 font-medium" : "text-gray-500")}>
                      {contact.lastMessage}
                    </p>
                    {contact.unread > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn("flex-1 flex-col bg-white", activeContact ? "flex" : "hidden md:flex")}>
        {activeContact ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${activeContact.id}`} alt={activeContact.name} referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{activeContact.name}</h3>
                  <p className="text-xs text-gray-500">{activeContact.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              {messages.map((msg) => {
                const isMe = msg.senderId === user.uid;
                return (
                  <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2.5",
                      isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={cn("text-[10px] mt-1 text-right", isMe ? "text-blue-100" : "text-gray-400")}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white shrink-0">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Type your message..." 
                  className="flex-1 bg-gray-100 border-transparent focus-visible:ring-1 rounded-full px-4"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  className="rounded-full w-10 h-10 p-0 shrink-0 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a contact to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
