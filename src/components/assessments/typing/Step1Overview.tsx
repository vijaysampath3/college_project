import React from 'react';
import { Keyboard, ArrowRight, Target, Clock, Activity } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { TypingPassage } from '../../../services/typing-passage.service';

interface Step1OverviewProps {
  passage: TypingPassage;
  onNext: () => void;
}

export const Step1Overview: React.FC<Step1OverviewProps> = ({ passage, onNext }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white mb-6 shadow-xl transform hover:scale-105 transition-transform">
          <Keyboard className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Typing Assessment</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Evaluate your typing speed, accuracy, and rhythm. We analyze your keystroke patterns to provide deep insights into your learning behavior.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white border-gray-200 hover:border-primary-300 transition-all hover:shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 text-primary-600">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Warmup Phase</h3>
            <p className="text-sm text-gray-600">Start with a 30-second unscored warmup to get your fingers ready.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 hover:border-primary-300 transition-all hover:shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 text-primary-600">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Typing Accuracy</h3>
            <p className="text-sm text-gray-600">Type the passage exactly as shown. Errors will be highlighted in red.</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 hover:border-primary-300 transition-all hover:shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 text-primary-600">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">AI Insights</h3>
            <p className="text-sm text-gray-600">Get personalized feedback based on your typing rhythm and error types.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-100 mb-10">
        <CardContent className="p-8">
          <h3 className="font-bold text-gray-900 mb-2">Your Passage:</h3>
          <p className="text-xl text-primary-900 font-medium">{passage.title}</p>
          <div className="flex gap-4 mt-4">
            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-600 shadow-sm capitalize">
              {passage.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm capitalize ${
              passage.difficulty === 'easy' ? 'bg-success-100 text-success-700' :
              passage.difficulty === 'medium' ? 'bg-warning-100 text-warning-700' :
              'bg-error-100 text-error-700'
            }`}>
              {passage.difficulty} Difficulty
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-600 shadow-sm">
              {passage.text.split(' ').length} words
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" onClick={onNext} className="group px-8 py-6 text-lg rounded-2xl shadow-xl shadow-primary-500/20">
          Begin Warmup
          <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
