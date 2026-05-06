package me.veilchat.app;

import android.view.WindowManager;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * ScreenSecurityPlugin — VeilChat native screen-protection bridge.
 *
 * Exposes two methods to JavaScript via the Capacitor bridge:
 *
 *   enable()  — Sets FLAG_SECURE on the activity window.
 *               While this flag is active the Android OS will render a black
 *               (blank) frame for any screenshot attempt, screen recording,
 *               and the Recents / Overview panel thumbnail.  This means that
 *               even a direct Power + Volume-Down press produces a useless
 *               all-black image — the View-Once content is never captured.
 *
 *   disable() — Clears FLAG_SECURE, restoring normal OS screenshot behaviour.
 *               Always call this when the secure viewer is closed.
 *
 * Both methods must modify the Window flags on the UI thread; all Capacitor
 * PluginMethod callbacks arrive on a background thread so we marshal onto the
 * main thread with Activity.runOnUiThread().
 *
 * The plugin is registered in MainActivity and called from
 * src/lib/screenSecurity.ts, which is a no-op on web and iOS.
 */
@CapacitorPlugin(name = "ScreenSecurity")
public class ScreenSecurityPlugin extends Plugin {

    /**
     * Activates FLAG_SECURE on the activity window.
     *
     * Called by the JS layer when a View-Once viewer opens.  After this call
     * returns any OS screenshot or screen-recording attempt will capture a
     * blank black frame instead of the actual screen content.
     */
    @PluginMethod
    public void enable(PluginCall call) {
        android.app.Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available.");
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                activity.getWindow().addFlags(
                        WindowManager.LayoutParams.FLAG_SECURE);
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to set FLAG_SECURE: " + e.getMessage());
            }
        });
    }

    /**
     * Clears FLAG_SECURE from the activity window.
     *
     * Called by the JS layer when a View-Once viewer is dismissed.  After
     * this call returns normal OS screenshot behaviour is restored.
     */
    @PluginMethod
    public void disable(PluginCall call) {
        android.app.Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available.");
            return;
        }
        activity.runOnUiThread(() -> {
            try {
                activity.getWindow().clearFlags(
                        WindowManager.LayoutParams.FLAG_SECURE);
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to clear FLAG_SECURE: " + e.getMessage());
            }
        });
    }
}
