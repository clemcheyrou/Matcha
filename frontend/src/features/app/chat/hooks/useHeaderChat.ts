import { useState, useEffect } from 'react';

type ChatHeaderData = {
  name: string;
  profileImage: string;
  is_connected: boolean;
  last_connected_at: string | null;
};

export const useHeaderChat = (chatId: number): ChatHeaderData => {
  const [headerData, setHeaderData] = useState<ChatHeaderData>({
    name: '',
	  is_connected: false,
    profileImage: '',
    last_connected_at: null
  });

  useEffect(() => {
    const fetchChatHeader = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/header`, {credentials: 'include'});
        const data = await response.json();
        setHeaderData({
          name: data.name,
		      is_connected: data.is_connected,
          last_connected_at: data.last_connected_at,
          profileImage: data.profileImage,
        });
      } catch (error) {
        console.error('error retrieving chat header', error);
      }
    };

    if (chatId) {
      fetchChatHeader();
    }
  }, [chatId]);

  return headerData;
};
