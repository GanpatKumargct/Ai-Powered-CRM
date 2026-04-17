import { useState, useRef, useEffect } from 'react';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to avoid issues with local workers in some environments
env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriberInstance = null;

export const useWhisper = (onTranscription) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const init = async () => {
      if (!transcriberInstance) {
        console.log("Initializing Whisper model (Xenova/whisper-tiny.en)...");
        try {
          transcriberInstance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
          console.log("Whisper model ready.");
        } catch (error) {
          console.error("Failed to initialize Whisper model:", error);
        }
      }
      setIsReady(true);
    };
    init();
  }, []);

  const startRecording = async () => {
    if (!isReady) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Transcription expects 16kHz mono Float32Array
          const float32Array = audioBuffer.getChannelData(0);
          
          const output = await transcriberInstance(float32Array, {
              chunk_length_s: 30,
              stride_length_s: 5,
              language: 'english',
              task: 'transcribe',
          });

          if (output.text) {
            onTranscription(output.text.trim());
          }
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return { isRecording, isReady, isProcessing, toggleRecording };
};
