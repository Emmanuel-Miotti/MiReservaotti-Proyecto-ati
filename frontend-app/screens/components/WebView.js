import React from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const WebViewScreen = ({ route }) => {
    const { url } = route.params;

    return (
        <WebView 
            source={{ uri: url }} 
            startInLoadingState={true}
            renderLoading={() => (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#1a73e8" />
                </View>
            )}
            style={{ flex: 1 }}
        />
    );
};

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default WebViewScreen;
