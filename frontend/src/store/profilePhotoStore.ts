import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProfilePhotoState = {
  photos: Record<string, string>;
  setPhoto: (userId: string, photoUrl: string) => void;
  removePhoto: (userId: string) => void;
};

export const useProfilePhotoStore = create<ProfilePhotoState>()(
  persist(
    (set) => ({
      photos: {},
      setPhoto: (userId, photoUrl) =>
        set((state) => ({
          photos: {
            ...state.photos,
            [userId]: photoUrl,
          },
        })),
      removePhoto: (userId) =>
        set((state) => {
          const next = { ...state.photos };
          delete next[userId];
          return { photos: next };
        }),
    }),
    {
      name: 'profile-photo-storage',
    },
  ),
);
