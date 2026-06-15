const BACKEND_URL = 'http://localhost:8000';

export const backendService = {
  async processAudio(blob: Blob, expectedText: string, durationSeconds: number, category: string, difficulty: string) {
    const formData = new FormData();
    // Assuming audio/webm or audio/mp3 based on MediaRecorder, name it audio.webm
    formData.append('audio', blob, 'audio.webm');
    formData.append('expected_text', expectedText);
    formData.append('duration_seconds', durationSeconds.toString());
    formData.append('passage_category', category);
    formData.append('passage_difficulty', difficulty);

    const response = await fetch(`${BACKEND_URL}/api/reading/process`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to process audio: ${errText}`);
    }

    return response.json();
  }
};
