import { useData } from '../../../context/DataContext';
import useIsMobile from './useIsMobile';
import ListingCard from './ListingCard';
import FlipCard2 from './FlipCard2';
import PremiumCard2 from './PremiumCard2';

// Picks which project card visual theme to render, per the admin's choice
// at Settings -> Card Style — set independently per page ('villas' |
// 'apartments' | 'home') and per device (desktop vs. mobile). 'classic' is
// the original ListingCard; 'flip' and 'premium' are the two client-supplied
// reference designs, wired to real project data.
export default function ProjectCard({ project, page = 'villas' }) {
  const { settings } = useData();
  const isMobile = useIsMobile();
  const pageStyle = settings.cardStyle?.[page] || {};
  const style = (isMobile ? pageStyle.mobile : pageStyle.desktop) || 'classic';

  if (style === 'flip') return <FlipCard2 project={project} />;
  if (style === 'premium') return <PremiumCard2 project={project} />;
  return <ListingCard project={project} />;
}
