import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { IndoorMapModal } from '../ui/IndoorMapModal';
import { WebView } from 'react-native-webview';

// Enhanced WebView mock
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    WebView: jest.fn().mockImplementation(({ onLoadStart, onLoadEnd, onError }) => {
      // Simulate loading sequence
      setTimeout(() => {
        onLoadStart();
        setTimeout(() => {
          onLoadEnd();
        }, 10);
      }, 10);
      return <View testID="mock-webview" />;
    }),
  };
});

jest.mock('../../components/ui/IconSymbol', () => 'IconSymbol');

describe('IndoorMapModal', () => {
  const mockBuilding = {
    type: 'Feature',
    properties: {
      Campus: 'SGW',
      Building: 'H',
      BuildingName: 'H Building',
      'Building Long Name': 'Henry F. Hall Building',
      Address: '1455 DeMaisonneuve W',
      PlaceID: 'ChIJtd6Zh2oayUwRAu_CnRIfoBw',
      Latitude: 45.497092,
      Longitude: -73.5788
    },
    geometry: {
      type: 'Point',
      coordinates: [-73.5788, 45.497092]
    }
  };

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    building: mockBuilding
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with building name', () => {
    const { getByText } = render(<IndoorMapModal {...defaultProps} />);
    expect(getByText('H Building • Indoor Map')).toBeTruthy();
  });

  it('calls onClose when back button is pressed', () => {
    const { getByTestId } = render(<IndoorMapModal {...defaultProps} />);
    fireEvent.press(getByTestId('back-button'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('configures WebView with correct URL', () => {
    render(<IndoorMapModal {...defaultProps} />);
    const webViewProps = (WebView as jest.Mock).mock.calls[0][0];
    expect(webViewProps.source.html).toContain('app.mappedin.com/map/677d8a736e2f5c000b8f3fa6');
  });

  it('shows and hides loading indicator properly', async () => {
    const { getByTestId, queryByTestId } = render(<IndoorMapModal {...defaultProps} />);
    
    // Initial loading state
    expect(getByTestId('loading-indicator')).toBeTruthy();
    
    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 30));
    });
    
    // Should be hidden after load
    expect(queryByTestId('loading-indicator')).toBeNull();
  });

  it('handles WebView errors properly', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<IndoorMapModal {...defaultProps} />);
    const webViewInstance = (WebView as jest.Mock).mock.calls[0][0];
    
    await act(async () => {
      webViewInstance.onError('Test error');
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('WebView error:', 'Test error');
    consoleSpy.mockRestore();
  });

  it('uses default building name when BuildingName is undefined', () => {
    const { getByText } = render(
      <IndoorMapModal 
        {...defaultProps}
        building={{
          ...mockBuilding,
          properties: {
            ...mockBuilding.properties,
            BuildingName: "undefined"
          }
        }}
      />
    );
    expect(getByText('Hall • Indoor Map')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(<IndoorMapModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles modal visibility changes', () => {
    const { rerender, queryByText } = render(
      <IndoorMapModal {...defaultProps} visible={false} />
    );
    expect(queryByText('H Building • Indoor Map')).toBeNull();
    
    rerender(<IndoorMapModal {...defaultProps} visible={true} />);
    expect(queryByText('H Building • Indoor Map')).toBeTruthy();
  });
});