import React from 'react';

interface MessageCardProps {
  message: string;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  return (
    <div>
      <h2>Lambda Message</h2>
      <p className="text-gray-700">{message}</p>
    </div>
  );
};
