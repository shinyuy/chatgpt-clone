import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import TextBlock from './TextBlock'

interface ChatAreaProps {
    conversationId: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({ conversationId }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState<string>('');
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at');
            if (error) console.error(error);
            // else setMessages(data);

            const parentAndChildData = data
                .map((msg) => {
                    if (msg.edited) {
                        // Find children for this parent message
                        const childMessages = data.filter(
                            (child) => child.parent_message_id === msg.id
                        );
                        childMessages.unshift({ ...msg, parent_message_id: msg.id });
                        return {
                            parent: msg,
                            children: childMessages, // Add children if message is edited
                        };
                    } else if (!msg.edited && msg.parent_message_id === null) {
                        return {
                            parent: msg,
                            children: [], // No children for non-edited messages
                        };
                    }
                    // Return undefined for cases that don't meet criteria
                    return undefined;
                })
                .filter((entry) => entry !== undefined && entry !== null); // Remove invalid entries

            setMessages(parentAndChildData)
        };

        fetchMessages();
    }, [conversationId, loading]);

    const callHuggingFaceAPI = async (question: string) => {
        setLoading(true);

        const apiUrl = "https://api-inference.huggingface.co/models/gpt2";
        const apiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: question, // Your input text
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();
            return result[0]?.generated_text
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const sendMessage = async () => {
        setLoading(true);
        if (!input.trim() || !conversationId) return;

        // Insert user message into Supabase
        const { data, error } = await supabase
            .from('messages')
            .insert([{ conversation_id: conversationId, text: input }])
            .select('*');

        if (error) {
            console.error(error);
        } else {
            // Update the messages state with the new user message
            setMessages((prevMessages) => [...prevMessages, ...data]);
        }

        setInput('');

        // Get response from HuggingFace API
        const answer = await callHuggingFaceAPI(input);

        if (answer && data && data[0]?.id) {
            // Update the existing user message with the response from HuggingFace
            const { error } = await supabase
                .from('messages')
                .update({ response: answer })
                .eq('id', data[0]?.id); // Update the inserted user message by its ID

            if (error) {
                console.error(error);
            } else {
                // Update the message state to include the updated response
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === data[0]?.id ? { ...msg, response: answer } : msg
                    )
                );
            }
        }
        setLoading(false);
    };

    const editMessage = async (id: string, newContent: string) => {
        setLoading(true);
        const { error: updateError } = await supabase.from('messages').update({ edited: true }).eq('id', id);
        if (updateError) console.error(updateError);

        const { data, error: insertError } = await supabase
            .from('messages')
            .insert([{ conversation_id: conversationId, text: newContent, parent_message_id: id }])
            .select('*');
        if (insertError) console.error(insertError);
        else setMessages((prev) => [...prev, ...data]);


        const answer = await callHuggingFaceAPI(newContent);

        if (answer && data && data[0]?.id) {
            // Update the existing user message with the response from HuggingFace
            const { error } = await supabase
                .from('messages')
                .update({ response: answer })
                .eq('id', data[0]?.id); // Update the inserted user message by its ID

            if (error) {
                console.error(error);
            } else {
                // Update the message state to include the updated response
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === data[0]?.id ? { ...msg, response: answer } : msg
                    )
                );
            }
            setLoading(false);

        }

        // setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, content: newContent } : msg)));
        setInput('');
        setEditingMessage(null);
    };


    return (
        <div className="ml-64 flex flex-col flex-1 bg-white items-center">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.length > 0 && messages.map((msg, i) => {

                    if (msg?.children?.length > 0) {
                        return <TextBlock key={i} text={msg.children[index]?.text} parent_message_id={msg.children[index]?.parent_message_id} response={msg.children[index]?.response} loading={loading} editingMessage={editingMessage} setEditingMessage={setEditingMessage} id={msg.children[index]?.id} childMessages={msg.children} index={index} setIndex={setIndex} editMessage={editMessage} setInput={setInput} input={input} />
                    } else {
                        return <TextBlock key={i} text={msg.parent?.text} response={msg.parent?.response} editingMessage={editingMessage} setEditingMessage={setEditingMessage} id={msg.parent?.id} childMessages={null} index={null} setIndex={setIndex} editMessage={editMessage} setInput={setInput} input={input} parent_message_id={undefined} loading={undefined} />
                    }
                }
                )}
            </div>
            {editingMessage == null &&
                <div className="p-4 border-t border-gray-300 flex items-center space-x-4 w-[50vw]">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none text-black"
                    />
                    <button disabled={loading} onClick={sendMessage} className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                        Send
                    </button>
                </div>}
        </div >
    );
};

export default ChatArea;
