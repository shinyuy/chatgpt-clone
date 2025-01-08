import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface SidebarProps {
    selectedConversation: string | null;
    setSelectedConversation: (id: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedConversation, setSelectedConversation }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [conversations, setConversations] = useState<any[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            const { data, error } = await supabase.from('conversations').select('*').order('created_at');
            if (error) console.error(error);
            else setConversations(data);
        };

        fetchConversations();
    }, []);

    const createNewConversation = async () => {
        const { data, error } = await supabase.from('conversations').insert([{ title: 'New Chat' }]).select('*');
        if (error) console.error(error);
        else setConversations((prev) => [...prev, ...data]);
    };

    return (
        <div className="w-64 bg-gray-900  text-white flex flex-col h-[100vh] fixed">
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-lg font-semibold">Conversations</h1>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`w-full text-left p-4 ${selectedConversation === conv.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                            }`}
                    >
                        {conv.title}
                    </button>
                ))}
            </div>
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={createNewConversation}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg"
                >
                    + New Chat
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
