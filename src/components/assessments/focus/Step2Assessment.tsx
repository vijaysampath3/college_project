import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { Task1Calibration } from './Task1Calibration';
import { Task2FocusTracking } from './Task2FocusTracking';
import { Task3VisualEngagement } from './Task3VisualEngagement';
import { Task4SustainedFocus } from './Task4SustainedFocus';

export interface FocusRawTelemetry {
  totalFrames: number;
  faceVisibleFrames: number;
  lookAwayFrames: number;
  faceLostEvents: number;
  lookAwayCount: number;
  totalLookAwayDurationMs: number;
  headStabilityAccumulator: number; // For average head movement
  taskAccuracy: number; // from task 3 and 4
}

interface Props {
  onComplete: (telemetry: FocusRawTelemetry) => void;
}

export const Step2Assessment: React.FC<Props> = ({ onComplete }) => {
  const [currentTask, setCurrentTask] = useState<1 | 2 | 3 | 4>(1);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>();
  
  // Real-time states for calibration
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCentered, setFaceCentered] = useState(false);
  const [diagnostics, setDiagnostics] = useState({
    facesFound: 0,
    confidence: 0,
    brightness: 0,
    yaw: 0,
    pitch: 0
  });
  
  // Telemetry tracking
  const telemetryRef = useRef<FocusRawTelemetry>({
    totalFrames: 0,
    faceVisibleFrames: 0,
    lookAwayFrames: 0,
    faceLostEvents: 0,
    lookAwayCount: 0,
    totalLookAwayDurationMs: 0,
    headStabilityAccumulator: 0,
    taskAccuracy: 0
  });

  const stateRef = useRef({
    isLookingAway: false,
    lookAwayStartTime: 0,
    isFaceLost: false
  });

  // Task 3 and 4 results
  const [task3Score, setTask3Score] = useState(0);
  const [task4Score, setTask4Score] = useState(0);

  // Initialize MediaPipe and Camera
  useEffect(() => {
    let active = true;

    const initVision = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (!active) return;
        landmarkerRef.current = landmarker;
        
        // Request Camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: "user" } 
        });
        
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            videoRef.current?.play().catch(console.error);
            setIsModelLoading(false);
            predictWebcam();
          };
        }
      } catch (err: any) {
        console.error("Camera/MediaPipe init error:", err);
        setModelError(err.message || "Failed to initialize camera or AI model.");
        setIsModelLoading(false);
      }
    };

    initVision();

    return () => {
      active = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, []);

  const predictWebcam = () => {
    if (!videoRef.current || !landmarkerRef.current) return;

    const video = videoRef.current;
    if (video.currentTime !== predictWebcam.lastVideoTime) {
      predictWebcam.lastVideoTime = video.currentTime;
      
      try {
        const result = landmarkerRef.current.detectForVideo(video, performance.now());
        processDetectionResult(result);
      } catch (e) {
        console.warn("Detection error", e);
      }
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };
  predictWebcam.lastVideoTime = -1;

  const processDetectionResult = (result: FaceLandmarkerResult) => {
    const isRunningTask = currentTask > 1; // Only record telemetry during tasks 2,3,4
    
    if (result.faceLandmarks.length === 0) {
      setFaceDetected(false);
      setFaceCentered(false);
      setDiagnostics(prev => ({ ...prev, facesFound: 0 }));
      
      if (isRunningTask) {
        telemetryRef.current.totalFrames++;
        if (!stateRef.current.isFaceLost) {
          stateRef.current.isFaceLost = true;
          telemetryRef.current.faceLostEvents++;
        }
        
        handleLookAway(true);
      }
      return;
    }

    setFaceDetected(true);
    stateRef.current.isFaceLost = false;
    
    if (isRunningTask) {
      telemetryRef.current.totalFrames++;
      telemetryRef.current.faceVisibleFrames++;
    }

    // Heuristics using bounding box center (simplified from landmarks)
    const landmarks = result.faceLandmarks[0];
    const nose = landmarks[1];
    
    // Check if centered
    const isCentered = nose.x > 0.3 && nose.x < 0.7 && nose.y > 0.3 && nose.y < 0.7;
    setFaceCentered(isCentered);

    if (isRunningTask) {
      // Rough pose estimation fallback based on landmark extreme points
      const leftEar = landmarks[234];
      const rightEar = landmarks[454];
      const eyeL = landmarks[159];
      const eyeR = landmarks[386];

      // Calculate yaw approximation using relative distances
      const faceWidth = rightEar.x - leftEar.x;
      const noseToLeft = nose.x - leftEar.x;
      const noseToRight = rightEar.x - nose.x;
      const yawRatio = noseToLeft / (faceWidth || 0.001); // 0.5 is perfectly straight
      
      // Calculate pitch approximation
      const eyeY = (eyeL.y + eyeR.y) / 2;
      const faceHeight = landmarks[152].y - landmarks[10].y; // Chin to top of head
      const noseYRatio = (nose.y - landmarks[10].y) / (faceHeight || 0.001); // ~0.5 is straight
      
      // Head stability
      const stabilityPenalty = Math.abs(0.5 - yawRatio) + Math.abs(0.5 - noseYRatio);
      telemetryRef.current.headStabilityAccumulator += stabilityPenalty;

      // Threshold for look away (approx > 25deg yaw or > 20deg pitch)
      const isLookingAway = yawRatio < 0.25 || yawRatio > 0.75 || noseYRatio < 0.3 || noseYRatio > 0.7;
      handleLookAway(isLookingAway);
    }
    
    // Update diagnostics for calibration
    if (currentTask === 1) {
      // Rough approximation of brightness using video frame if needed, but we'll leave it as a dummy or simple heuristic for now
      // since FaceLandmarker doesn't give lighting directly. 
      const leftEar = landmarks[234];
      const rightEar = landmarks[454];
      const faceWidth = rightEar.x - leftEar.x;
      const noseToLeft = nose.x - leftEar.x;
      const yawRatio = noseToLeft / (faceWidth || 0.001);
      
      const eyeY = (landmarks[159].y + landmarks[386].y) / 2;
      const faceHeight = landmarks[152].y - landmarks[10].y;
      const noseYRatio = (nose.y - landmarks[10].y) / (faceHeight || 0.001);

      setDiagnostics({
        facesFound: 1,
        // We don't get direct confidence from FaceLandmarkerResult easily in the typed interface, default to 0.99 for display
        confidence: 0.99, 
        brightness: 75, // Mocked for now, as real brightness needs canvas pixel extraction
        yaw: Math.round((yawRatio - 0.5) * 100),
        pitch: Math.round((noseYRatio - 0.5) * 100)
      });
    }
  };

  const handleLookAway = (currentlyLookingAway: boolean) => {
    const now = performance.now();
    const state = stateRef.current;
    
    if (currentlyLookingAway) {
      telemetryRef.current.lookAwayFrames++;
      if (!state.isLookingAway) {
        state.isLookingAway = true;
        state.lookAwayStartTime = now;
      }
    } else {
      if (state.isLookingAway) {
        state.isLookingAway = false;
        const duration = now - state.lookAwayStartTime;
        // Only count as lookaway event if > 1 second
        if (duration > 1000) {
          telemetryRef.current.lookAwayCount++;
          telemetryRef.current.totalLookAwayDurationMs += duration;
        }
      }
    }
  };

  const finalizeAssessment = (t4Score: number) => {
    const finalAccuracy = (task3Score + t4Score) / 2;
    telemetryRef.current.taskAccuracy = finalAccuracy;
    
    // Close remaining lookaway if active
    if (stateRef.current.isLookingAway) {
       const duration = performance.now() - stateRef.current.lookAwayStartTime;
       if (duration > 1000) {
         telemetryRef.current.lookAwayCount++;
         telemetryRef.current.totalLookAwayDurationMs += duration;
       }
    }
    
    onComplete(telemetryRef.current);
  };

  if (modelError) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Camera Error</h2>
        <p className="text-gray-600 mb-6">{modelError}</p>
        <p className="text-sm text-gray-500">Please ensure you have granted camera permissions and no other app is using your webcam.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hidden Video element for MediaPipe processing */}
      <video 
        ref={videoRef} 
        style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', pointerEvents: 'none' }} 
        playsInline 
        autoPlay 
        muted 
      />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {currentTask === 1 && "Camera Calibration"}
          {currentTask === 2 && "Task 1: Focus Tracking"}
          {currentTask === 3 && "Task 2: Visual Engagement"}
          {currentTask === 4 && "Task 3: Sustained Focus"}
        </h2>
        <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
          Stage {currentTask} of 4
        </div>
      </div>

      {isModelLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Initializing AI Vision Model...</h3>
          <p className="text-gray-500 mt-2">Downloading lightweight face tracking bundle (~2MB).</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col relative">
          
          {/* Progress Bar for internal steps */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10">
            <div 
              className="h-full bg-primary-500 transition-all duration-500"
              style={{ width: `${(currentTask / 4) * 100}%` }}
            />
          </div>

          <div className="flex-1 p-6">
            {currentTask === 1 && (
              <Task1Calibration 
                stream={streamRef.current} 
                faceDetected={faceDetected} 
                faceCentered={faceCentered}
                diagnostics={diagnostics}
                onReady={() => setCurrentTask(2)} 
              />
            )}
            
            {currentTask === 2 && (
              <Task2FocusTracking onComplete={() => setCurrentTask(3)} />
            )}

            {currentTask === 3 && (
              <Task3VisualEngagement onComplete={(score) => {
                setTask3Score(score);
                setCurrentTask(4);
              }} />
            )}

            {currentTask === 4 && (
              <Task4SustainedFocus onComplete={(score) => {
                setTask4Score(score);
                finalizeAssessment(score);
              }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
