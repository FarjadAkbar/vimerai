import { VideosService } from '@/application/videos/videos.service';
import { VideoKind, VideoStatus } from '@/domain/video.entity';
import { InMemoryVideoRepository } from '@/testing/fakes/in-memory-video.repository';

describe('VideosService', () => {
  it('saves a Blitz edit into the user library', async () => {
    const repo = new InMemoryVideoRepository();
    const service = new VideosService(repo);

    const { video } = await service.saveBlitzEdit('user-42', {
      videoUrl: 'https://cdn.example.com/edit.mp4',
      hook: 'POV: this edit stuck',
      formatId: 'green-screen',
      volume: 0.6,
      textStyle: { fontFamily: 'Inter', fontSize: 22, color: '#ffffff' },
      mentionBusiness: true,
    });

    expect(video.userId).toBe('user-42');
    expect(video.kind).toBe(VideoKind.USER);
    expect(video.status).toBe(VideoStatus.COMPLETED);
    expect(video.videoUrl).toBe('https://cdn.example.com/edit.mp4');
    expect(video.formatId).toBe('green-screen');
    expect(JSON.parse(video.prompt).hook).toBe('POV: this edit stuck');

    const library = await service.getUserVideos('user-42', 10, 0);
    expect(library.total).toBe(1);
    expect(library.videos[0].id).toBe(video.id);
  });
});
