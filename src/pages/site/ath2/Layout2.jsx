import { Outlet } from 'react-router-dom';
import Nav2 from './Nav2';
import Footer2 from './Footer2';
import BottomNav from './BottomNav';
import InstallPrompt from './InstallPrompt';
import MayaChat from './MayaChat';
import WhatsAppButton from './WhatsAppButton';
import AnnouncementBar from './AnnouncementBar';
import PopupManager from './PopupManager';
import ScriptInjector from './ScriptInjector';
import ThemeInjector from './ThemeInjector';
import { ConfirmProvider } from '../../../components/admin/ConfirmProvider';
import '../../../styles/ath2.css';

export default function Layout2() {
  return (
    <ConfirmProvider>
      <div className="ath2">
        <ThemeInjector />
        <ScriptInjector />
        <AnnouncementBar />
        <Nav2 />
        <main><Outlet /></main>
        <Footer2 />
        <BottomNav />
        <InstallPrompt />
        <MayaChat />
        <WhatsAppButton />
        <PopupManager />
      </div>
    </ConfirmProvider>
  );
}
