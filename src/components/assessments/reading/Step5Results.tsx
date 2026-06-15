import React, { useState, useEffect } from 'react';
import { 
  Award, Brain, Activity, Clock, AlertTriangle, CheckCircle, ArrowLeft, 
  Target, FileText, Mic, FileAudio, Database, ChevronDown, ChevronUp, Code, BarChart, Hash
} from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { CelebrationModal } from '../CelebrationModal';

interface Step5ResultsProps {
  session: any;
  onReturn: () => void;
}

export const Step5Results: React.FC<Step5ResultsProps> = ({ session, onReturn }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPassageOpen, setIsPassageOpen] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    if (session.blob) {
      const url = URL.createObjectURL(session.blob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [session.blob]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const metrics = session.metricsData || {};
  const details = metrics.details || {};
  const transcript = session.transcriptData || {};
  const passage = session.passage || {};
  
  // Safe Fallbacks
  const accuracy = metrics.accuracy ?? 0;
  const wpm = metrics.wpm ?? 0;
  const wer = metrics.wer ?? 0;
  const coverage = metrics.coverage ?? 0;
  const similarity = metrics.similarity ?? 0;
  
  const expectedWords = details.expectedWords ?? 0;
  const transcriptWords = transcript.text ? transcript.text.split(' ').length : 0;
  const matchedWords = details.matchedWords ?? 0;
  const missingWords = details.missingWords ?? 0;
  const extraWords = details.extraWords ?? 0;
  const substitutedWords = details.substitutedWords ?? 0;
  const alignment = details.alignment || [];

  // Performance Logic
  let performanceLevel = 'Needs Attention';
  let performanceColor = 'text-danger-600';
  let performanceBg = 'bg-danger-50';
  if (accuracy > 95) {
    performanceLevel = 'Excellent';
    performanceColor = 'text-success-600';
    performanceBg = 'bg-success-50';
  } else if (accuracy >= 85) {
    performanceLevel = 'Good';
    performanceColor = 'text-primary-600';
    performanceBg = 'bg-primary-50';
  }

  // Quality Indicators
  const fluency = wpm > 120 ? 'Excellent' : wpm >= 90 ? 'Good' : 'Needs Attention';
  const consistency = similarity > 90 ? 'High' : similarity >= 75 ? 'Moderate' : 'Low';

  const renderAlignment = () => {
    if (alignment.length === 0) {
      return <span className="text-gray-500 italic">No transcript alignment data available.</span>;
    }

    return alignment.map((chunk: any, index: number) => {
      if (chunk.type === 'equal') {
        return <span key={index} className="text-success-700 bg-success-50 px-1 mx-0.5 rounded">{chunk.actual}</span>;
      }
      if (chunk.type === 'missing') {
        return <span key={index} className="text-danger-700 bg-danger-50 px-1 mx-0.5 rounded line-through">{chunk.expected}</span>;
      }
      if (chunk.type === 'extra') {
        return <span key={index} className="text-warning-700 bg-warning-50 px-1 mx-0.5 rounded underline decoration-warning-400">{chunk.actual}</span>;
      }
      if (chunk.type === 'substitute') {
        return (
          <span key={index} className="inline-flex flex-col text-xs mx-1 align-bottom leading-tight">
            <span className="text-danger-500 line-through">{chunk.expected}</span>
            <span className="text-info-700 bg-info-50 px-1 rounded">{chunk.actual}</span>
          </span>
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {showCelebration && session.rewardResult && (
        <CelebrationModal 
          rewardResult={session.rewardResult} 
          onClose={() => setShowCelebration(false)} 
        />
      )}

      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-success-50 text-success-600 flex items-center justify-center mb-6">
          <Award className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Assessment Validation Complete</h1>
        <p className="text-lg text-gray-600 mb-4">
          Detailed analytics and diagnostics for this assessment session.
        </p>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
      
        {/* --- AI INSIGHTS --- */}
        {(session.insightsData?.summary || session.insightsData?.recommendations?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary-500" /> Performance Summary
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {session.insightsData.summary || "No summary generated."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 bg-primary-50">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Recommended Next Steps
                </h3>
                <ul className="space-y-3">
                  {session.insightsData.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-primary-900">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- PERFORMANCE & QUALITY --- */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Reading Performance Level</p>
                <h3 className={`text-3xl font-bold ${performanceColor}`}>{performanceLevel}</h3>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${performanceBg} ${performanceColor}`}>
                <Award className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Reading Quality Indicators
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500 block">Fluency</span><span className="font-bold text-gray-900">{fluency}</span></div>
                <div><span className="text-gray-500 block">Consistency</span><span className="font-bold text-gray-900">{consistency}</span></div>
                <div><span className="text-gray-500 block">Coverage</span><span className="font-bold text-gray-900">{coverage}%</span></div>
                <div><span className="text-gray-500 block">Confidence</span><span className="font-bold text-gray-900">{transcript.confidence || 0}%</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- CORE METRICS --- */}
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mt-8 mb-4">Reading Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white border-gray-100 shadow-sm text-center py-4">
            <p className="text-xs font-bold text-gray-500 uppercase">Accuracy</p>
            <p className="text-2xl font-bold text-gray-900">{accuracy}%</p>
          </Card>
          <Card className="bg-white border-gray-100 shadow-sm text-center py-4">
            <p className="text-xs font-bold text-gray-500 uppercase">WPM</p>
            <p className="text-2xl font-bold text-gray-900">{wpm}</p>
          </Card>
          <Card className="bg-white border-gray-100 shadow-sm text-center py-4">
            <p className="text-xs font-bold text-gray-500 uppercase">Similarity</p>
            <p className="text-2xl font-bold text-gray-900">{similarity}%</p>
          </Card>
          <Card className="bg-white border-gray-100 shadow-sm text-center py-4">
            <p className="text-xs font-bold text-gray-500 uppercase">Coverage</p>
            <p className="text-2xl font-bold text-gray-900">{coverage}%</p>
          </Card>
          <Card className="bg-white border-gray-100 shadow-sm text-center py-4">
            <p className="text-xs font-bold text-gray-500 uppercase">WER</p>
            <p className="text-2xl font-bold text-gray-900">{wer}</p>
          </Card>
        </div>

        {/* --- TRANSCRIPT ANALYSIS --- */}
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mt-8 mb-4">Transcript Analysis</h2>
        
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex gap-4 text-xs font-bold uppercase">
              <span className="flex items-center gap-1 text-success-700"><div className="w-2 h-2 rounded-full bg-success-500"></div> Correct</span>
              <span className="flex items-center gap-1 text-danger-700"><div className="w-2 h-2 rounded-full bg-danger-500"></div> Missing</span>
              <span className="flex items-center gap-1 text-warning-700"><div className="w-2 h-2 rounded-full bg-warning-500"></div> Extra</span>
              <span className="flex items-center gap-1 text-info-700"><div className="w-2 h-2 rounded-full bg-info-500"></div> Substituted</span>
            </div>
            <div className="p-6 text-lg leading-loose text-gray-800 bg-white min-h-[150px]">
              {renderAlignment()}
            </div>
          </CardContent>
        </Card>

        {/* --- WORD STATISTICS --- */}
        <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mt-8 mb-4">Word Statistics</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
          <Card className="bg-gray-50 border-none py-3">
            <p className="text-xl font-bold text-gray-900">{expectedWords}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Expected</p>
          </Card>
          <Card className="bg-gray-50 border-none py-3">
            <p className="text-xl font-bold text-gray-900">{transcriptWords}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Transcript</p>
          </Card>
          <Card className="bg-success-50 text-success-700 border-none py-3">
            <p className="text-xl font-bold">{matchedWords}</p>
            <p className="text-[10px] font-bold uppercase">Matched</p>
          </Card>
          <Card className="bg-danger-50 text-danger-700 border-none py-3">
            <p className="text-xl font-bold">{missingWords}</p>
            <p className="text-[10px] font-bold uppercase">Missing</p>
          </Card>
          <Card className="bg-warning-50 text-warning-700 border-none py-3">
            <p className="text-xl font-bold">{extraWords}</p>
            <p className="text-[10px] font-bold uppercase">Extra</p>
          </Card>
          <Card className="bg-info-50 text-info-700 border-none py-3">
            <p className="text-xl font-bold">{substitutedWords}</p>
            <p className="text-[10px] font-bold uppercase">Substituted</p>
          </Card>
        </div>

        {/* --- METADATA SECTIONS --- */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Mic className="w-4 h-4" /> Whisper Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Model Used</span>
                  <span className="font-mono text-gray-900">faster-whisper base</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-bold text-gray-900">{transcript.confidence || 0}%</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Audio Duration</span>
                  <span className="font-bold text-gray-900">{session.blobDuration || session.duration || 0}s</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-500">Processing Time</span>
                  <span className="font-bold text-gray-900">{session.processingTime || 0}s</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Passage Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Title</span>
                  <span className="font-medium text-gray-900 text-right max-w-[200px] truncate">{passage.title || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900 capitalize">{passage.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Difficulty</span>
                  <span className="font-medium text-gray-900 capitalize">{passage.difficulty || 'N/A'}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-500">Passage ID</span>
                  <span className="font-mono text-xs text-gray-900">{passage.id || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- DEV DIAGNOSTICS --- */}
        <Card className="border-gray-200 mt-8 overflow-hidden bg-gray-900 text-gray-300">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
            onClick={() => setIsDevOpen(!isDevOpen)}
          >
            <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 mb-0 uppercase tracking-wider">
              <Code className="w-4 h-4 text-primary-400" /> Developer Diagnostics
            </h3>
            {isDevOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
          {isDevOpen && (
            <div className="p-6 pt-2 border-t border-gray-800 text-xs font-mono space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-800">
                <div><span className="text-gray-500 block mb-1">Session ID</span><span className="text-gray-300">{session.sessionId || 'N/A'}</span></div>
                <div><span className="text-gray-500 block mb-1">Attempt Number</span><span className="text-gray-300">{session.attemptNumber || 1}</span></div>
                <div><span className="text-gray-500 block mb-1">Status</span><span className="text-success-400">{session.status}</span></div>
                <div><span className="text-gray-500 block mb-1">Timestamp</span><span className="text-gray-300">{formatDate(session.completedAt)}</span></div>
              </div>
              <div>
                <span className="text-gray-500 block mb-2">Raw API Payload</span>
                <pre className="bg-gray-950 p-4 rounded overflow-x-auto text-primary-300">
                  {JSON.stringify({ transcript, metrics, insights: session.insightsData, ai: session.aiData }, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Card>

      </div>

      <div className="flex justify-center border-t border-gray-100 pt-8 max-w-4xl mx-auto mt-12">
        <Button size="lg" onClick={onReturn}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Return to Assessment Hub
        </Button>
      </div>
    </div>
  );
};
