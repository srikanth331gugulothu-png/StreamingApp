
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Dialog, Grid, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { Header } from '../components/Header';
import { VideoCard } from '../components/VideoCard';
import { VideoDetails } from '../components/VideoDetails';
import { VideoPlayer } from '../components/VideoPlayer';
import { streamingService } from '../services/streaming.service';

export const Collection = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadCollection = useCallback(async () => {
    setLoading(true);

    try {
      const videos = await streamingService.getVideos();
      setItems(videos.map((video) => ({ video })));
    } catch (error) {
      console.error('Failed to load collection:', error);
      setItems([]);
      toast.error('Unable to load your collection right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const handlePlay = (video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const handleInfo = (video) => {
    setSelectedVideo(video);
    setIsPlaying(false);
  };

  const handleCloseDialog = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  const emptyState = useMemo(
    () => (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h4" gutterBottom>
          No videos available
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Uploaded videos will appear here when they are available.
        </Typography>
      </Box>
    ),
    [],
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />

      <Box sx={{ pt: { xs: 10, sm: 11, md: 12 }, px: { xs: 2, md: 6 }, pb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          My Collection
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          emptyState
        ) : (
          <Grid container spacing={3}>
            {items.map(({ video }) => (
              <Grid item key={video._id} xs={12} sm={6} md={4} lg={3}>
                <VideoCard
                  video={video}
                  onPlay={handlePlay}
                  onInfo={handleInfo}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog
        fullScreen
        open={Boolean(selectedVideo)}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(5,5,5,0.95)',
          },
        }}
      >
        {selectedVideo &&
          (isPlaying ? (
            <VideoPlayer
              video={selectedVideo}
              onClose={handleCloseDialog}
            />
          ) : (
            <VideoDetails
              video={selectedVideo}
              onPlay={() => setIsPlaying(true)}
              onClose={handleCloseDialog}
            />
          ))}
      </Dialog>
    </Box>
  );
};
