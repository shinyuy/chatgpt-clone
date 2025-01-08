import React from 'react';

const TextBlock = ({ text, response, editingMessage, parent_message_id, setEditingMessage, id, children, index, setIndex, editMessage, setInput, input, loading }) => {

    return (
        <div className="flex flex-col space-y-4 w-[50vw]">
            {editingMessage === id ? (
                <>
                    <span className='mr-2 text-blue-500 cursor-pointer text-xs' onClick={() => setEditingMessage(null)}>Cancel</span>

                    <div className="p-4 border-t border-gray-300 flex items-center space-x-4 w-[50vw]">
                        <input
                            type="text"
                            defaultValue={text}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none text-black"
                        />
                        <button disabled={loading} onClick={() => editMessage(parent_message_id ? parent_message_id : id, input)} className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                            Send
                        </button>
                    </div>
                </>

            ) : (
                <>

                    <div className='flex justify-end'>
                        <span className='mr-2 text-blue-500 cursor-pointer text-xs' onClick={() => setEditingMessage(id)}>Edit</span> <div
                            className='inline-block px-4 py-2 rounded-lg  text-black bg-gray-200'
                            onDoubleClick={() => setEditingMessage(id)}
                        >
                            {text}
                        </div>

                    </div>

                    <div className='flex justify-end text-black'>
                        {children?.length > 0 && (
                            <div>
                                <span className={`${index > 0 && 'cursor-pointer text-blue-500'}`} onClick={() => index > 0 && setIndex(index - 1)}>prev </span> {index + 1}/{children.length} <span onClick={() => index < children.length - 1 && setIndex(index + 1)} className={`${index < children.length - 1 && 'cursor-pointer text-blue-500'}`}> next</span>
                            </div>
                        )}
                    </div>

                    {response &&
                        <div
                            className='inline-block px-4 py-2 rounded-lg text-gray-900'
                            onDoubleClick={() => setEditingMessage(id)}
                        >
                            {response}
                        </div>}
                </>
            )}
        </div>
    );
};

export default TextBlock;
