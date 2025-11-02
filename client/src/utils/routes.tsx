// Route configuration for Scard application
// This file defines all application routes

import SplashScreenWrapper from "../components/SplashScreenWrapper";
import GameScreen from "../components/GameScreen";
import NotFoundScreen from "../components/NotFoundScreen";

export const scardRoutes = [
  {
    path: '/',
    content: <SplashScreenWrapper />
  },
  {
    path: '/play',
    content: <GameScreen />
  },
  {
    path: '*',
    content: <NotFoundScreen />
  },
];

