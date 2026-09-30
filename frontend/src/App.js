import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { SurveyProvider } from './context/SurveyContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import GoldenQuestion from './components/GoldenQuestion';
import WelcomeAnimation from './components/WelcomeAnimation';
import SurveyLayer1 from './components/survey/Layer1';
import SurveyLayer2 from './components/survey/Layer2';
import SurveyLayer3 from './components/survey/Layer3';
import Results from './components/Results';
import RewardOptimization from './components/RewardOptimization';
import ExistingCard from './components/ExistingCard';
import CardComparison from './components/CardComparison';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SurveyProvider>
      <Routes>
        <Route path="/"                element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
        <Route path="/login"           element={<ErrorBoundary><Login /></ErrorBoundary>} />
        <Route path="/golden-question" element={<ErrorBoundary><GoldenQuestion /></ErrorBoundary>} />
        <Route path="/welcome"         element={<ErrorBoundary><WelcomeAnimation /></ErrorBoundary>} />
        <Route path="/survey/layer1"   element={<ErrorBoundary><SurveyLayer1 /></ErrorBoundary>} />
        <Route path="/survey/layer2"   element={<ErrorBoundary><SurveyLayer2 /></ErrorBoundary>} />
        <Route path="/survey/layer3"   element={<ErrorBoundary><SurveyLayer3 /></ErrorBoundary>} />
        <Route path="/results"              element={<ErrorBoundary><Results /></ErrorBoundary>} />
        <Route path="/reward-optimization"  element={<ErrorBoundary><RewardOptimization /></ErrorBoundary>} />
        <Route path="/existing-card"        element={<ErrorBoundary><ExistingCard /></ErrorBoundary>} />
        <Route path="/compare"              element={<ErrorBoundary><CardComparison /></ErrorBoundary>} />
        <Route path="*"                    element={<NotFound />} />
      </Routes>
      </SurveyProvider>
    </BrowserRouter>
  );
}

export default App;
