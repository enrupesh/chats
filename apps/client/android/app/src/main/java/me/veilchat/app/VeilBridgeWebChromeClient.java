package me.veilchat.app;

import android.webkit.PermissionRequest;

import androidx.annotation.NonNull;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;

/**
 * WebChromeClient override for Capacitor WebView.
 *
 * Android WebView routes getUserMedia() permission decisions through
 * onPermissionRequest(). Some devices/ROMs default this to deny even after the
 * app-level RECORD_AUDIO runtime permission was granted. We explicitly allow
 * audio capture requests so in-app voice recording works reliably.
 */
public class VeilBridgeWebChromeClient extends BridgeWebChromeClient {
    private final Bridge bridge;

    public VeilBridgeWebChromeClient(@NonNull Bridge bridge) {
        super(bridge);
        this.bridge = bridge;
    }

    @Override
    public void onPermissionRequest(@NonNull final PermissionRequest request) {
        final String[] resources = request.getResources();
        boolean wantsAudio = false;
        for (String r : resources) {
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) {
                wantsAudio = true;
                break;
            }
        }

        if (!wantsAudio) {
            super.onPermissionRequest(request);
            return;
        }

        // PermissionRequest callbacks must be handled on the UI thread.
        bridge.getActivity().runOnUiThread(() -> request.grant(resources));
    }
}

