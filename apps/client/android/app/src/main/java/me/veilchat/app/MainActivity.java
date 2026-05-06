package me.veilchat.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import android.content.Context;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String MESSAGES_CHANNEL_ID = "veilchat_messages";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register native plugins before calling super.onCreate so Capacitor
        // can wire them up before the WebView is created.
        registerPlugin(WebAuthnPlugin.class);
        registerPlugin(ScreenSecurityPlugin.class);
        super.onCreate(savedInstanceState);
        installWebChromeClientOverrides();
        createNotificationChannelIfNeeded();
    }

    /**
     * Install a WebChromeClient that explicitly grants WebRTC audio capture
     * requests (getUserMedia) in our WebView once app permissions are allowed.
     */
    private void installWebChromeClientOverrides() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;
        webView.setWebChromeClient(new VeilBridgeWebChromeClient(getBridge()));
    }

    /**
     * Android 8+ requires an existing notification channel for any push
     * payload that specifies channelId. Our FCM payloads use
     * "veilchat_messages", so we create/update it at startup.
     */
    private void createNotificationChannelIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager nm =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        NotificationChannel channel = new NotificationChannel(
            MESSAGES_CHANNEL_ID,
            "Messages",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Real-time VeilChat message notifications");
        channel.enableVibration(true);
        channel.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        nm.createNotificationChannel(channel);
    }
}
