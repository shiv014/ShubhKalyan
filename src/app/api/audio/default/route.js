import { NextResponse } from 'next/server';

export async function GET() {
  // URLs for Indian wedding/classical music
  const urls = [
    "https://archive.org/download/dli.akashvani.sangeet.24/02_Bismillah_Khan_Shehnai_Raag_Poorvi_Dhun.mp3",
    "https://cdn.pixabay.com/download/audio/2022/11/22/audio_03d987a02c.mp3?filename=indian-background-music-126273.mp3"
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg, audio/*;q=0.9, */*;q=0.8'
        }
      });
      if (res.ok) {
        return new NextResponse(res.body, {
          headers: {
            'Content-Type': res.headers.get('content-type') || 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400',
            'Accept-Ranges': 'bytes'
          }
        });
      }
    } catch (err) {
      console.error('Error fetching fallback audio from', url, err);
    }
  }

  return new NextResponse('Audio unavailable', { status: 500 });
}
