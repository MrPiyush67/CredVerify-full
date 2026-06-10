import React, { lazy } from 'react'
import {Routes, Route} from 'react-router-dom';
import ProtectedRoute from '@common/components/ProtetedRoute.jsx';
import PublicRoute from '@common/components/PublicRoute.jsx'
const LoginPage = lazy(() => import("@features/auth/pages/LoginPage/jsx"))
const SignupPage = lazy(() => import("@features/auth/pages/SignupPage.jsx"));
const LandingPage = lazy(() => import('@featurs/landing/pages/LandingPage.jsx'))
const HomePage = lazy(() => import('@featurs/landing/pages/HomePage.jsx'))
const HomePage = lazy(() => import('@featurs/landing/pages/HomePage.jsx'))
const ChatPage = lazy(() => import('@featurs/landing/pages/ChatPage.jsx'))
const ProfilePage = lazy(() => import('@featurs/landing/pages/ProfilePage.jsx'))

