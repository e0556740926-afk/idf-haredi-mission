import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { TodayScreen } from './features/today/TodayScreen';
import { ActivityScreen } from './features/activity/ActivityScreen';
import { HomeScreen } from './features/home/HomeScreen';
import { RitualScreen } from './features/ritual/RitualScreen';
import { CashflowScreen } from './features/cashflow/CashflowScreen';
import { OnboardingScreen } from './features/onboarding/OnboardingScreen';
import { AccountsScreen } from './features/accounts/AccountsScreen';
import { RecurringScreen } from './features/recurring/RecurringScreen';
import { InsightsScreen } from './features/insights/InsightsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { CanvasScreen } from './features/canvas/CanvasScreen';

export function App() {
  return (
    <Routes>
      {import.meta.env.DEV && <Route path="/canvas" element={<CanvasScreen />} />}
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/flow" element={<CashflowScreen />} />
        <Route path="/activity" element={<ActivityScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/ritual" element={<RitualScreen />} />
        <Route path="/accounts" element={<AccountsScreen />} />
        <Route path="/recurring" element={<RecurringScreen />} />
        <Route path="/insights" element={<InsightsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Route>
    </Routes>
  );
}
