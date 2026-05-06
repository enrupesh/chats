package me.veilchat.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register native plugins before calling super.onCreate so Capacitor
        // can wire them up before the WebView is created.
        registerPlugin(WebAuthnPlugin.class);
        registerPlugin(ScreenSecurityPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
