import { IconInbox } from "../assets/icons";
import { COLORS } from "../utils/dataGenerator";

 

const EmptyState = ({searchQuery,selectedEventTypes,selectedSources}:any) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
    }}>
      <div style={{ color: COLORS.textLight, marginBottom: 16, opacity: 0.6 }}>
        <IconInbox />
      </div>
      <h3 style={{
        fontSize: 16,
        fontWeight: 600,
        color: COLORS.text,
        marginBottom: 8,
      }}>No events found</h3>
      <p style={{
        fontSize: 14,
        color: COLORS.textLight,
        maxWidth: 300,
      }}>
        {searchQuery || selectedEventTypes.length > 0 || selectedSources.length > 0
          ? 'Try adjusting your filters or search query'
          : 'No events available at the moment'}
      </p>
    </div>
);
  
export default EmptyState;