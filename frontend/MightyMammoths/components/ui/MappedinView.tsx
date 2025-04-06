import React, { useRef, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, ActivityIndicator, View, Text, Linking, TouchableOpacity } from 'react-native';
import { getMapId } from '../../services/mappedinService';

interface MappedinViewProps {
  buildingName: string;
  roomId?: string;
  entranceId?: string;
  onMapLoaded?: () => void;
  onError?: (error: string) => void;
}

const MappedinView: React.FC<MappedinViewProps> = ({
  buildingName,
  roomId,
  entranceId,
  onMapLoaded,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmbeddedView, setIsEmbeddedView] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Generate the URL for the Mappedin map
   */
  function getMapUrl(buildingName: string, roomId?: string, entranceId?: string): string {
    // Default to Hall Building if not specified
    const mapId = getMapId(buildingName) || "677d8a736e2f5c000b8f3fa6"; // Hall Building ID
    
    // Base URL for the map
    let url = `https://app.mappedin.com/map/${mapId}`;
    
    // Add directional info if both room and entrance are specified
    if (roomId && entranceId) {
      url = `${url}/directions?location=${roomId}&departure=${entranceId}`;
    } 
    // Just show the room if only room is specified
    else if (roomId) {
      url = `${url}/routes/${roomId}`;
    }
    
    return url;
  }

  // Simple HTML that just embeds the Mappedin web app in an iframe
  const getHtmlContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #010213; }
            iframe { border: 0; width: 100%; height: 100%; }
            .fallback { 
              display: flex; 
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100%;
              color: white;
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .fallback h2 { margin-bottom: 10px; }
            .fallback p { margin-bottom: 20px; }
            .fallback a { 
              color: #4a90e2; 
              text-decoration: none;
              margin-top: 20px;
              background: white;
              padding: 10px 20px;
              border-radius: 5px;
              color: #333;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${isEmbeddedView ? 
            `<iframe 
              src="${getMapUrl(buildingName, roomId, entranceId)}"
              allow="geolocation" 
              allowfullscreen
              onerror="handleIframeError()"
            ></iframe>
            <script>
              function handleIframeError() {
                document.body.innerHTML = createFallbackHTML();
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                  type: 'ERROR', 
                  message: 'Failed to load iframe content' 
                }));
              }
              
              function createFallbackHTML() {
                return '<div class="fallback">' +
                  '<h2>${buildingName}</h2>' +
                  '<p>Indoor map is available in the web browser.</p>' +
                  '<a href="${getMapUrl(buildingName, roomId, entranceId)}" target="_blank">Open Map in Browser</a>' +
                '</div>';
              }
            </script>` 
            : 
            `<div class="fallback">
              <h2>${buildingName}</h2>
              <p>Indoor map is available in the web browser.</p>
              <a href="${getMapUrl(buildingName, roomId, entranceId)}" target="_blank">Open Map in Browser</a>
             </div>`
          }
          <script>
            // Send load complete message
            window.onload = function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_LOADED' }));
            };
            
            // Handle errors
            window.onerror = function(message) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'ERROR', 
                message: message 
              }));
              return true;
            };
          </script>
        </body>
      </html>
    `;
  };

  // Handle messages from the WebView
  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'MAP_LOADED') {
        setIsLoading(false);
        onMapLoaded?.();
      } else if (data.type === 'ERROR') {
        console.error('WebView error:', data.message);
        setHasError(true);
        // If we get an error with the embedded view, try the fallback
        if (isEmbeddedView) {
          setIsEmbeddedView(false);
        } else {
          onError?.(data.message);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      setHasError(true);
      onError?.(`Error parsing WebView message: ${error}`);
    }
  };

  const openInBrowser = () => {
    const url = getMapUrl(buildingName, roomId, entranceId);
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.error('Cannot open URL:', url);
      }
    });
  };

  if (hasError && !isEmbeddedView) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>{buildingName}</Text>
        <Text style={styles.fallbackText}>
          Indoor map could not be loaded in the app.
        </Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={openInBrowser}>
          <Text style={styles.fallbackButtonText}>Open Map in Browser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading indoor map...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: getHtmlContent() }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => {
          // Sometimes onLoad doesn't trigger the postMessage, so we'll set loading to false here as well
          setTimeout(() => setIsLoading(false), 2000);
        }}
        onError={(error) => {
          console.error('WebView error:', error);
          setHasError(true);
          // If we get an error with the embedded view, try the fallback
          if (isEmbeddedView) {
            setIsEmbeddedView(false);
          } else {
            onError?.('WebView error: ' + error.nativeEvent.description);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 2, 19, 0.8)',
    zIndex: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#010213',
    padding: 20,
  },
  fallbackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  fallbackText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  fallbackButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#010213',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MappedinView;