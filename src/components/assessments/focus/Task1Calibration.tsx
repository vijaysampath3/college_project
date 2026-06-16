import React, { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Camera } from 'lucide-react';
import { Button } from '../../../components/ui';

interface Props {
  stream: MediaStream | null;
  faceDetected: boolean;
  faceCentered: boolean;
  diagnostics?: {
    facesFound: number;
    confidence: number;
    brightness: number;
    yaw: number;
    pitch: number;
  };
  onReady: () => void;
}

export const Task1Calibration: React.FC<Props> = ({ stream, faceDetected, faceCentered, diagnostics, onReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const cameraGranted = stream !== null && stream.active;
  const lightingOk = faceDetected; // Basic heuristic: if AI sees face, lighting is sufficient
  
  // Relaxed conditions for MVP
  const allReady = cameraGranted && faceDetected;

  useEffect(() => {
    if (cameraGranted && !allReady) {
      const timer = setTimeout(() => {
        if (!faceDetected) {
          console.warn("Calibration takes >5s. Diagnostics:", diagnostics);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [cameraGranted, allReady, faceDetected, diagnostics]);

  const renderCheck = (label: string, isOk: boolean, isRequired: boolean = true) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${isOk ? 'bg-gray-50 border-gray-100' : (isRequired ? 'bg-danger-50 border-danger-100' : 'bg-warning-50 border-warning-100')}`}>
      {isOk ? (
        <CheckCircle2 className="w-5 h-5 text-success-500" />
      ) : (
        isRequired ? <XCircle className="w-5 h-5 text-danger-500" /> : <AlertCircle className="w-5 h-5 text-warning-500" />
      )}
      <div className="flex flex-col">
        <span className={`font-medium ${isOk ? 'text-gray-900' : (isRequired ? 'text-danger-700' : 'text-warning-700')}`}>{label}</span>
        {!isOk && !isRequired && (
          <span className="text-xs text-warning-600 mt-0.5">
            {label === 'Face Centered' ? 'Move slightly closer to the center.' : 'Lighting could be improved.'}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full items-center">
      <div className="flex-1 w-full relative">
        <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative shadow-lg">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="flex items-center justify-center h-full flex-col text-gray-500">
              <Camera className="w-12 h-12 mb-2 opacity-50" />
              <p>Waiting for camera...</p>
            </div>
          )}

          {/* Centering Guide Overlay */}
          <div className="absolute inset-0 pointer-events-none border-4 border-black/10">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-dashed rounded-full transition-colors duration-300 ${faceCentered ? 'border-success-500 bg-success-500/10' : 'border-warning-500 bg-warning-500/10'}`} />
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Calibration Checklist</h3>
          <p className="text-sm text-gray-500 mb-6">Please ensure all checks pass before starting.</p>
          
          <div className="space-y-3">
            {renderCheck('Camera Permission Granted', cameraGranted, true)}
            {renderCheck('Face Detected', faceDetected, true)}
            {renderCheck('Face Centered', faceCentered, false)}
            {renderCheck('Lighting Acceptable', lightingOk, false)}
          </div>
        </div>

        {/* Temporary Diagnostics Panel */}
        {diagnostics && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono">
            <h4 className="text-white mb-2 font-semibold">Debug Diagnostics</h4>
            <div>Faces Found: {diagnostics.facesFound}</div>
            <div>Detection Confidence: {diagnostics.confidence.toFixed(2)}</div>
            <div>Brightness Score: {diagnostics.brightness}</div>
            <div>Yaw: {diagnostics.yaw}°</div>
            <div>Pitch: {diagnostics.pitch}°</div>
          </div>
        )}

        <Button 
          onClick={onReady} 
          disabled={!allReady}
          className="w-full py-4 text-lg"
        >
          {allReady ? "Begin Tracking" : "Waiting for checks..."}
        </Button>
      </div>
    </div>
  );
};
