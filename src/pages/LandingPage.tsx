import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  Target,
  Users,
  BarChart3,
  Shield,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Play,
  Star,
  BookOpen,
  Heart,
  Zap,
  TrendingUp,
  Clock,
  Lightbulb,
} from 'lucide-react';
import { Button, Badge } from '../components/ui';

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Detection',
      description: 'Advanced algorithms analyze learning patterns to identify potential difficulties early.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Personalized Insights',
      description: 'Get tailored recommendations and interventions based on individual student needs.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Progress Tracking',
      description: 'Monitor improvement over time with detailed analytics and visual reports.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Student data is encrypted and protected with enterprise-grade security.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Multi-Stakeholder',
      description: 'Unified platform for teachers, parents, and administrators.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Engaging Assessments',
      description: 'Interactive, game-like assessments that students enjoy taking.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Quick Screening',
      description: 'Students complete engaging assessments in reading, attention, and cognitive skills.',
      icon: <BookOpen className="w-8 h-8" />,
    },
    {
      step: 2,
      title: 'AI Analysis',
      description: 'Our algorithms analyze responses to identify patterns and potential difficulties.',
      icon: <Brain className="w-8 h-8" />,
    },
    {
      step: 3,
      title: 'Personalized Report',
      description: 'Receive detailed insights with actionable recommendations for improvement.',
      icon: <Target className="w-8 h-8" />,
    },
    {
      step: 4,
      title: 'Track Progress',
      description: 'Monitor improvement and adjust interventions based on real-time data.',
      icon: <TrendingUp className="w-8 h-8" />,
    },
  ];

  const benefits = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Save Time',
      description: 'Automated screening saves educators hours of manual assessment work.',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Better Outcomes',
      description: 'Early intervention leads to significantly improved learning outcomes.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Quick Results',
      description: 'Get actionable insights within minutes, not weeks.',
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Smart Recommendations',
      description: 'Evidence-based strategies tailored to each student\'s needs.',
    },
  ];

  const stats = [
    { value: '50,000+', label: 'Students Screened' },
    { value: '500+', label: 'Schools Using NeuroLearn' },
    { value: '92%', label: 'Accuracy Rate' },
    { value: '3x', label: 'Earlier Detection' },
  ];

  const testimonials = [
    {
      quote: 'NeuroLearn has transformed how we identify learning difficulties. We catch issues months earlier now.',
      author: 'Dr. Sarah Mitchell',
      role: 'Special Education Director',
      school: 'Lincoln School District',
    },
    {
      quote: 'The personalized recommendations have helped my son improve his reading skills dramatically.',
      author: 'Jennifer Thompson',
      role: 'Parent',
      school: 'Parent of 4th Grader',
    },
    {
      quote: 'Finally, a tool that makes assessment engaging for students while providing us deep insights.',
      author: 'Michael Chen',
      role: 'Elementary School Principal',
      school: 'Westfield Elementary',
    },
  ];

  const faqs = [
    {
      question: 'How does NeuroLearn detect learning difficulties?',
      answer: 'Our platform uses a combination of cognitive science research, machine learning algorithms, and validated assessment methodologies. Students complete engaging tasks that measure reading fluency, attention span, working memory, and processing speed. Our AI analyzes response patterns, timing, and accuracy to identify potential difficulties.',
    },
    {
      question: 'Is NeuroLearn suitable for all age groups?',
      answer: 'Yes, NeuroLearn is designed for students from kindergarten through high school. Our assessments adapt to different age groups, ensuring appropriate difficulty levels and engagement for each student.',
    },
    {
      question: 'How accurate is the screening?',
      answer: 'Our screening tools have been validated against clinical assessments with a 92% accuracy rate. While NeuroLearn does not replace professional evaluation, it serves as an effective early warning system that helps educators identify students who may benefit from further assessment.',
    },
    {
      question: 'How long does an assessment take?',
      answer: 'A complete screening typically takes 20-30 minutes, broken into short, engaging segments. Students can pause and resume later, making it easy to fit into regular school schedules.',
    },
    {
      question: 'What happens after a potential difficulty is identified?',
      answer: 'Teachers and parents receive detailed reports with specific recommendations. The platform suggests targeted interventions, classroom accommodations, and at-home activities. We also provide resources for professional assessment referrals when needed.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                NeuroLearn
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                How It Works
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Testimonials
              </a>
              <a href="#faq" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                FAQ
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4">
            <a href="#features" className="block text-gray-600 hover:text-primary-600 py-2">Features</a>
            <a href="#how-it-works" className="block text-gray-600 hover:text-primary-600 py-2">How It Works</a>
            <a href="#testimonials" className="block text-gray-600 hover:text-primary-600 py-2">Testimonials</a>
            <a href="#faq" className="block text-gray-600 hover:text-primary-600 py-2">FAQ</a>
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Link to="/login" className="block">
                <Button variant="secondary" className="w-full">Login</Button>
              </Link>
              <Link to="/login" className="block">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning Assessment
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Early Detection.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                Better Learning Outcomes.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Identify learning difficulties like dyslexia and ADHD with AI-powered screening.
              Help every student reach their full potential.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="group">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Login
                </Button>
              </Link>
            </div>

            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
              <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-600 p-8 sm:p-12">
                  <div className="grid grid-cols-3 gap-4 sm:gap-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white/80 text-sm">Assessment Score</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">78%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white/80 text-sm">Attention Level</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">High</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white/80 text-sm">Progress</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">+12%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Everything You Need for Early Detection
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to help educators identify and support students with learning differences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary-100"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white mb-4 shadow-lg shadow-primary-500/25">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary">Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">
              How NeuroLearn Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A simple four-step process to identify and support students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/25">
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center text-xs font-bold text-primary-600">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <ArrowRight className="w-6 h-6 text-primary-300 mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="primary">Assessment Types</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-6">
                Comprehensive Screening Suite
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="p-3 rounded-xl bg-primary-100">
                    <BookOpen className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Reading Assessment</h4>
                    <p className="text-gray-600 text-sm">
                      Phonemic awareness, decoding, fluency, and comprehension evaluation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="p-3 rounded-xl bg-secondary-100">
                    <Target className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Attention Screening</h4>
                    <p className="text-gray-600 text-sm">
                      Focus duration, distractibility, and attention control measurement.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="p-3 rounded-xl bg-success-100">
                    <Brain className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Cognitive Skills</h4>
                    <p className="text-gray-600 text-sm">
                      Working memory, processing speed, and executive function assessment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary-100 to-secondary-100 p-8 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400" />
                      <div>
                        <p className="font-semibold text-gray-900">Reading Task</p>
                        <p className="text-sm text-gray-500">Question 5 of 20</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
                    </div>
                  </div>
                  <div className="transform translate-x-8 bg-white rounded-2xl shadow-xl p-6">
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-success-50 border border-success-200 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success-600" />
                        <span className="text-sm font-medium text-success-700">Correct!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-gray-50 text-center text-sm">Option A</div>
                        <div className="p-3 rounded-xl bg-primary-100 border-2 border-primary-500 text-center text-sm font-medium text-primary-700">Option B</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-white/10 text-white border-white/20">Benefits</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-4">
              Why Schools Choose NeuroLearn
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Empowering educators and parents to support every learner.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-white/70 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6">
                <p className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Trusted by Educators
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See what teachers, parents, and administrators are saying about NeuroLearn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-400 fill-warning-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                    <p className="text-xs text-gray-400">{testimonial.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about NeuroLearn.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Learning Outcomes?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of schools using NeuroLearn to identify and support students with learning differences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <button className="flex items-center gap-2 text-white font-medium hover:text-white/80 transition-colors">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">NeuroLearn</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered learning difficulty screening for schools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Assessments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FERPA</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2024 NeuroLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
