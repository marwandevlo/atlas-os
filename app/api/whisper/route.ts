import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;
    
    if (!audio) return NextResponse.json({ error: 'No audio' }, { status: 400 });

    const whisperForm = new FormData();
    whisperForm.append('file', audio, 'audio.webm');
    whisperForm.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: whisperForm,
    });

    if (!response.ok) throw new Error('Whisper error');
    const data = await response.json();
    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error('Whisper error:', error);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}