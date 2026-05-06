package me.veilchat.app;

import android.os.Build;
import android.os.CancellationSignal;

import androidx.annotation.NonNull;
import androidx.credentials.CreateCredentialResponse;
import androidx.credentials.CreatePublicKeyCredentialRequest;
import androidx.credentials.CreatePublicKeyCredentialResponse;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.GetPublicKeyCredentialOption;
import androidx.credentials.PublicKeyCredential;
import androidx.credentials.exceptions.CreateCredentialCancellationException;
import androidx.credentials.exceptions.CreateCredentialException;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.credentials.exceptions.NoCredentialException;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executors;

/**
 * Native Android passkey bridge for VeilChat.
 *
 * Uses the Android Credential Manager API (androidx.credentials) to
 * create and retrieve FIDO2 passkeys. This is required because
 * Capacitor's WebView does not expose window.PublicKeyCredential,
 * so @simplewebauthn/browser cannot perform passkey ceremonies
 * directly in the WebView.
 *
 * Requires Android 9+ (API 28+) for Credential Manager support.
 * Older devices get a clear rejection from the plugin.
 *
 * The JSON formats passed in (requestJson) and returned out
 * (responseJson) follow the WebAuthn spec and are compatible with
 * @simplewebauthn/server on the backend.
 */
@CapacitorPlugin(name = "WebAuthn")
public class WebAuthnPlugin extends Plugin {

    /**
     * Check whether this device supports passkey creation/authentication.
     * Requires Android 9+ (API level 28).
     */
    @PluginMethod
    public void isSupported(PluginCall call) {
        JSObject result = new JSObject();
        result.put("supported", Build.VERSION.SDK_INT >= Build.VERSION_CODES.P);
        call.resolve(result);
    }

    /**
     * Create a new passkey credential.
     *
     * @param requestJson  WebAuthn PublicKeyCredentialCreationOptions JSON string
     *                     (produced by @simplewebauthn/server generateRegistrationOptions).
     * Returns: { responseJson: string } — WebAuthn registration response JSON
     *          compatible with @simplewebauthn/server verifyRegistrationResponse.
     */
    @PluginMethod
    public void create(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            call.reject("Passkeys require Android 9 or later.");
            return;
        }

        String requestJson = call.getString("requestJson");
        if (requestJson == null || requestJson.isEmpty()) {
            call.reject("requestJson is required.");
            return;
        }

        android.app.Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is not available.");
            return;
        }

        // Keep the call alive across the async Credential Manager callback.
        call.setKeepAlive(true);

        CredentialManager credentialManager = CredentialManager.create(getContext());
        CreatePublicKeyCredentialRequest request =
                new CreatePublicKeyCredentialRequest(requestJson);

        credentialManager.createCredentialAsync(
                activity,
                request,
                new CancellationSignal(),
                Executors.newSingleThreadExecutor(),
                new CredentialManagerCallback<CreateCredentialResponse, CreateCredentialException>() {
                    @Override
                    public void onResult(@NonNull CreateCredentialResponse result) {
                        call.setKeepAlive(false);
                        if (result instanceof CreatePublicKeyCredentialResponse) {
                            String responseJson =
                                    ((CreatePublicKeyCredentialResponse) result)
                                            .getRegistrationResponseJson();
                            JSObject response = new JSObject();
                            response.put("responseJson", responseJson);
                            call.resolve(response);
                        } else {
                            call.reject("Unexpected credential response type.");
                        }
                    }

                    @Override
                    public void onError(@NonNull CreateCredentialException e) {
                        call.setKeepAlive(false);
                        call.reject(friendlyCreateError(e));
                    }
                }
        );
    }

    /**
     * Retrieve an existing passkey credential for sign-in.
     *
     * @param requestJson  WebAuthn PublicKeyCredentialRequestOptions JSON string
     *                     (produced by @simplewebauthn/server generateAuthenticationOptions).
     * Returns: { responseJson: string } — WebAuthn authentication response JSON
     *          compatible with @simplewebauthn/server verifyAuthenticationResponse.
     */
    @PluginMethod
    public void get(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            call.reject("Passkeys require Android 9 or later.");
            return;
        }

        String requestJson = call.getString("requestJson");
        if (requestJson == null || requestJson.isEmpty()) {
            call.reject("requestJson is required.");
            return;
        }

        android.app.Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity is not available.");
            return;
        }

        call.setKeepAlive(true);

        CredentialManager credentialManager = CredentialManager.create(getContext());
        GetPublicKeyCredentialOption option =
                new GetPublicKeyCredentialOption(requestJson);
        GetCredentialRequest request = new GetCredentialRequest.Builder()
                .addCredentialOption(option)
                .build();

        credentialManager.getCredentialAsync(
                activity,
                request,
                new CancellationSignal(),
                Executors.newSingleThreadExecutor(),
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(@NonNull GetCredentialResponse result) {
                        call.setKeepAlive(false);
                        if (result.getCredential() instanceof PublicKeyCredential) {
                            String responseJson =
                                    ((PublicKeyCredential) result.getCredential())
                                            .getAuthenticationResponseJson();
                            JSObject response = new JSObject();
                            response.put("responseJson", responseJson);
                            call.resolve(response);
                        } else {
                            call.reject("Unexpected credential type returned.");
                        }
                    }

                    @Override
                    public void onError(@NonNull GetCredentialException e) {
                        call.setKeepAlive(false);
                        call.reject(friendlyGetError(e));
                    }
                }
        );
    }

    private static String friendlyCreateError(CreateCredentialException e) {
        if (e instanceof CreateCredentialCancellationException) {
            return "Passkey setup was cancelled.";
        }
        String msg = e.getMessage();
        if (msg != null) {
            if (msg.toLowerCase().contains("cancel") || msg.toLowerCase().contains("interrupt")) {
                return "Passkey setup was cancelled.";
            }
            if (msg.toLowerCase().contains("duplicate") || msg.toLowerCase().contains("already")) {
                return "This device already has a passkey registered.";
            }
        }
        return (msg != null && !msg.isEmpty()) ? msg : "Passkey could not be created.";
    }

    private static String friendlyGetError(GetCredentialException e) {
        if (e instanceof GetCredentialCancellationException) {
            return "Passkey sign-in was cancelled.";
        }
        if (e instanceof NoCredentialException) {
            return "No passkey found for this app. Please register a passkey first.";
        }
        String msg = e.getMessage();
        if (msg != null && (msg.toLowerCase().contains("cancel") || msg.toLowerCase().contains("interrupt"))) {
            return "Passkey sign-in was cancelled.";
        }
        return (msg != null && !msg.isEmpty()) ? msg : "Passkey sign-in failed.";
    }
}
