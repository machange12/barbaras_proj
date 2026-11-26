import { AppRouter } from './app/AppRouter';
import { EntranceGate } from './components/entrance/EntranceGate';

export default function App() {
  return (
    <EntranceGate>
      <AppRouter />
    </EntranceGate>
  );
}
