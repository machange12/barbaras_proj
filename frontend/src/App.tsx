import { AppRouter } from './app/AppRouter';
import { EntranceGate } from './components/entrance/EntranceGate';
import { useDocumentPrefs } from './lib/prefs';

export default function App() {
  useDocumentPrefs();

  return (
    <EntranceGate>
      <AppRouter />
    </EntranceGate>
  );
}
