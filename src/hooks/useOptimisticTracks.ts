import { useMutationState } from '@tanstack/react-query';
import { CreateTrackDto, UpdateTrackDto, Track } from '@/types';

export function useOptimisticTracks(initialTracks: Track[]) {
  const [optimisticNewTrack] = useMutationState({
    filters: { mutationKey: ['add-track'], status: 'pending' },
    select: (mutation) => mutation.state.variables as CreateTrackDto,
  });
  const [optimisticUpdatedTrack] = useMutationState({
    filters: { mutationKey: ['update-track'], status: 'pending' },
    select: (mutation) =>
      mutation.state.variables as { id: string; data: UpdateTrackDto },
  });
  const [optimisticDeletedTrack] = useMutationState({
    filters: { mutationKey: ['delete-track'], status: 'pending' },
    select: (mutation) => mutation.state.variables as { id: string },
  });

  let tracks: Track[] = initialTracks;

  if (optimisticNewTrack) {
    tracks = [
      {
        ...optimisticNewTrack,
        id: 'optimistic-' + Date.now(),
        slug: optimisticNewTrack.title.toLowerCase().replace(/\s+/g, '-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...initialTracks,
    ];
  }

  if (optimisticUpdatedTrack) {
    tracks = initialTracks.map((track) => {
      if (track.id === optimisticUpdatedTrack.id) {
        return {
          ...track,
          ...optimisticUpdatedTrack.data,
        };
      }

      return track;
    });
  }

  if (optimisticDeletedTrack) {
    tracks = initialTracks.filter(
      (track) => track.id !== optimisticDeletedTrack.id
    );
  }

  return tracks;
}
