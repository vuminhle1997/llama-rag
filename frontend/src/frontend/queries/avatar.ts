// use react-query and axios to get the avatar of a chat, with credentials. Set the reponse as imageURl with React state.
// response is a blob, set the avatar by URL.createObjectURL(response.data)
import axios from "axios";
import { useEffect, useState } from "react";

export const useGetAvatar = (chatId: string) => {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/avatar/${chatId}`, {
          withCredentials: true,
          responseType: 'blob',
        });
        
        setAvatar(URL.createObjectURL(response.data));
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };
    fetchAvatar();
  }, [chatId]);

  return { avatar };
};


// same as above but with /profile-picture
export const useGetProfilePicture = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile-picture`, {
          withCredentials: true,
          responseType: 'blob',
        }); 

        setProfilePicture(URL.createObjectURL(response.data));
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };
    fetchProfilePicture();
  }, []);

  return { profilePicture };
};
