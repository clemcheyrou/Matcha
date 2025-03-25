import { useState, useEffect } from 'react';

type ChatHeaderData = {
  name: string;
  profileImage: string;
  is_connected: boolean;
};

export const useHeaderChat = (chatId: number): ChatHeaderData => {
  const [headerData, setHeaderData] = useState<ChatHeaderData>({
    name: '',
	is_connected: false,
    profileImage: '',
  });

  useEffect(() => {
    const fetchChatHeader = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/chat/${chatId}/header`, {credentials: 'include'});
        const data = await response.json();
        setHeaderData({
          name: data.name,
		  is_connected: data.is_connected,
          profileImage: data.profileImage,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des données du chat:', error);
      }
    };

    if (chatId) {
      fetchChatHeader();
    }
  }, [chatId]);

  return headerData;
};
