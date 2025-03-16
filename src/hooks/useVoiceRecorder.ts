import { useState, useCallback } from 'react';
import { uploadFile } from '@/lib/fileUpload';

interface VoiceRecorderState {
  isRecording: boolean;
  audioURL: string | null;
  error: string | null;
}

export const useVoiceRecorder = () => {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    audioURL: null,
    error: null,
  });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(chunks => [...chunks, e.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        const dataUrl = await uploadFile(audioFile);
        setState(prev => ({ ...prev, audioURL: dataUrl }));
        setAudioChunks([]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setState(prev => ({ ...prev, isRecording: true, error: null }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Could not access microphone. Please ensure you have granted permission.'
      }));
    }
  }, [audioChunks]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setState(prev => ({ ...prev, isRecording: false }));
    }
  }, [mediaRecorder]);

  const resetRecording = useCallback(() => {
    setState({
      isRecording: false,
      audioURL: null,
      error: null,
    });
    setAudioChunks([]);
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording,
  };
}; 