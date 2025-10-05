import React from 'react';
import { Box, List, ListItem, ListItemButton, Typography, CircularProgress } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FlagIcon from '@mui/icons-material/Flag';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TramIcon from '@mui/icons-material/Tram';
import TrainIcon from '@mui/icons-material/Train';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import SubwayIcon from '@mui/icons-material/Subway';
import PlaceIcon from '@mui/icons-material/Place';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { PlaceSuggestion } from '../../../hooks/usePlaceSearch';

interface AutocompleteDropdownProps {
  suggestions: PlaceSuggestion[];
  loading: boolean;
  error: string | null;
  onSelect: (suggestion: PlaceSuggestion) => void;
  visible: boolean;
}

export default function AutocompleteDropdown({
  suggestions,
  loading,
  error,
  onSelect,
  visible,
}: AutocompleteDropdownProps) {
  if (!visible || (!loading && !error && suggestions.length === 0)) {
    return null;
  }

  const formatPlaceName = (suggestion: PlaceSuggestion) => {
    if (suggestion.properties.isCoordinate) {
      return suggestion.properties.label ?? suggestion.properties.name;
    }

    const { name, street, housenumber, city, country } = suggestion.properties;
    const parts = [];

    if (housenumber && street) {
      parts.push(`${street} ${housenumber}`);
    } else if (street) {
      parts.push(street);
    }

    if (name && !parts.includes(name)) {
      parts.unshift(name);
    }

    if (city && !parts.includes(city)) {
      parts.push(city);
    }

    if (country && !parts.includes(country) && parts.length < 3) {
      parts.push(country);
    }

    return parts.join(', ');
  };

  function getPlaceIcon(suggestion: PlaceSuggestion) {
    if (suggestion.properties.isCoordinate) {
      return <GpsFixedIcon color="action" sx={{ mr: 1 }} />;
    }

    const { osm_key, osm_value, station } = suggestion.properties as any;
    const value = typeof osm_value === 'string' ? osm_value : '';
    // City, village, town, hamlet
    if (osm_key === 'place') {
      if ([
        'city', 'town', 'village', 'hamlet', 'suburb', 'quarter', 'neighbourhood', 'isolated_dwelling', 'municipality', 'locality', 'borough', 'district', 'region', 'state', 'province', 'county', 'island', 'archipelago'
      ].includes(value)) {
        return <ApartmentIcon color="action" sx={{ mr: 1 }} />;
      }
      if (value === 'country') {
        return <FlagIcon color="action" sx={{ mr: 1 }} />;
      }
    }
    // Public institutions
    if (osm_key === 'amenity' && [
      'townhall', 'courthouse', 'public_building', 'government_office', 'embassy', 'community_centre', 'library', 'police', 'fire_station', 'post_office', 'bank', 'customs', 'prison', 'tax_office', 'consulate', 'social_facility', 'administrative', 'public_institution'
    ].includes(value)) {
      return <AccountBalanceIcon color="action" sx={{ mr: 1 }} />;
    }
    // Schools/universities
    if (osm_key === 'amenity' && [
      'school', 'college', 'university', 'kindergarten', 'music_school', 'driving_school', 'language_school', 'research_institute', 'education_centre'
    ].includes(value)) {
      return <SchoolIcon color="action" sx={{ mr: 1 }} />;
    }
    // Metro (subway)
    if ((osm_key === 'railway' && value === 'subway_entrance') || (osm_key === 'railway' && value === 'subway_station') || (osm_key === 'railway' && value === 'station' && station === 'subway')) {
      return <SubwayIcon color="action" sx={{ mr: 1 }} />;
    }
    // Bus stop
    if (osm_key === 'highway' && value === 'bus_stop') {
      return <DirectionsBusIcon color="action" sx={{ mr: 1 }} />;
    }
    // Tram stop
    if (osm_key === 'railway' && value === 'tram_stop') {
      return <TramIcon color="action" sx={{ mr: 1 }} />;
    }
    // Train station
    if (osm_key === 'railway' && value === 'station' && station !== 'subway') {
      return <TrainIcon color="action" sx={{ mr: 1 }} />;
    }
    if (osm_key === 'railway' && value === 'halt') {
      return <TrainIcon color="action" sx={{ mr: 1 }} />;
    }
    // Boat/port
    if ((osm_key === 'amenity' && value === 'ferry_terminal') || (osm_key === 'harbour') || (osm_key === 'man_made' && value === 'pier')) {
      return <DirectionsBoatIcon color="action" sx={{ mr: 1 }} />;
    }
    // Airport
    if ((osm_key === 'aeroway' && ['aerodrome', 'airport', 'helipad'].includes(value))) {
      return <AirplanemodeActiveIcon color="action" sx={{ mr: 1 }} />;
    }
    // Default
    return <PlaceIcon color="action" sx={{ mr: 1 }} />;
  }

  // Limit to max 6 results
  const visibleSuggestions = suggestions.slice(0, 6);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 1000,
        border: '2px solid',
        borderColor: 'primary.main',
        borderTop: 'none',
        borderRadius: '0 0 4px 4px',
        backgroundColor: 'background.paper',
        mt: '-2px',
        overflow: 'hidden',
      }}
    >
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {error && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && visibleSuggestions.length > 0 && (
        <List dense sx={{ py: 0 }}>
          {visibleSuggestions.map((suggestion: PlaceSuggestion, index: number) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(suggestion);
                }}
                sx={{
                  py: 1,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {getPlaceIcon(suggestion)}
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatPlaceName(suggestion)}
                  </Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}