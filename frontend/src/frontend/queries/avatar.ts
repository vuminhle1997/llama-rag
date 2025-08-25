'use client';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { selectAuthorized, useAppSelector } from '../store';

/**
 * Custom hook to fetch and return the avatar image for a given chat ID.
 *
 * @param {string} chatId - The ID of the chat for which to fetch the avatar.
 * @returns {{ avatar: string | null }} - An object containing the avatar URL or null if not available.
 *
 * @example
 * const { avatar } = useGetAvatar('chat123');
 * if (avatar) {
 *   // Use the avatar URL
 * }
 *
 * @remarks
 * This hook uses the `axios` library to make an HTTP GET request to the backend API to fetch the avatar image.
 * The avatar image is expected to be returned as a blob, which is then converted to a URL using `URL.createObjectURL`.
 * The hook also handles errors by logging them to the console.
 */
export const useGetAvatar = (chatId: string) => {
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) return;
    const fetchAvatar = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/avatar/${chatId}`,
          {
            withCredentials: true,
            responseType: 'blob',
            headers: {
              'Cache-Control':
                'no-store, no-cache, must-revalidate, proxy-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            },
          }
        );

        setAvatar(URL.createObjectURL(response.data));
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    };
    fetchAvatar();
  }, [chatId]);

  return { avatar };
};

/**
 * Custom hook to fetch and return the user's profile picture.
 *
 * This hook uses `useState` to manage the profile picture state and `useEffect` to fetch the profile picture
 * from the backend when the component mounts. The profile picture is fetched as a blob and converted to a
 * URL object which is then set in the state.
 *
 * @returns {Object} An object containing the profile picture URL.
 * @returns {string | null} profilePicture - The URL of the profile picture or null if not yet fetched.
 */
export const useGetProfilePicture = () => {
  const isAuth = useAppSelector(selectAuthorized);

  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile-picture`,
          {
            withCredentials: true,
            responseType: 'blob',
          }
        );

        setProfilePicture(URL.createObjectURL(response.data));
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };
    if (isAuth) {
      fetchProfilePicture();
    }
  }, [isAuth]);

  return { profilePicture };
};
