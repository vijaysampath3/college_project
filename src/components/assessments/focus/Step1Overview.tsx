import React from 'react';
import { Camera, Shield, Eye, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';

interface Props {
  onNext: () => void;
}

export const Step1Overview: React.FC<Props> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <Camera className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Focus & Engagement Assessment</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          This assessment uses your webcam to analyze your focus patterns, screen attention, and head stability during interactive challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="border-l-4 border-l-indigo-500 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">What to Expect</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">Takes approximately 3 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">You will complete 3 visual tasks on screen</span>
              </li>
              <li className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-gray-700">Requires a working webcam and good lighting</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success-500 shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-success-500" />
              Privacy & Security
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 shrink-0" />
                <span className="text-gray-700"><strong>No video is recorded or stored.</strong> All analysis happens directly on your device.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 shrink-0" />
                <span className="text-gray-700">Only numerical scores (like focus %) are saved to your profile.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 shrink-0" />
                <span className="text-gray-700">You will be asked for camera permission on the next screen.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-start gap-3 mb-10">
        <AlertTriangle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
        <div className="text-sm text-warning-800">
          <strong>Preparation:</strong> Please ensure your face is well-lit and you are seated comfortably in front of your screen. Avoid wearing sunglasses or heavy masks.
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={onNext} size="lg" className="px-8 py-4 text-lg rounded-xl shadow-lg group">
          Start Calibration
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
