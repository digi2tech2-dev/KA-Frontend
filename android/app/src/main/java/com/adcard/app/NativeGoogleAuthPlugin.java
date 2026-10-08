package com.adcard.app;

import androidx.annotation.NonNull;
import androidx.credentials.ClearCredentialStateRequest;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.ClearCredentialException;
import androidx.credentials.exceptions.GetCredentialException;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

@CapacitorPlugin(name = "NativeGoogleAuth")
public class NativeGoogleAuthPlugin extends Plugin {
    private CredentialManager credentialManager;

    @Override
    public void load() {
        credentialManager = CredentialManager.create(getContext());
    }

    @com.getcapacitor.PluginMethod
    public void signIn(PluginCall call) {
        String webClientId = getContext().getString(R.string.google_web_client_id).trim();
        if (webClientId.isEmpty()) {
            call.reject("GOOGLE_CONFIG_MISSING: GOOGLE_WEB_CLIENT_ID is not configured in the Android build.");
            return;
        }

        GetGoogleIdOption googleIdOption = new GetGoogleIdOption.Builder()
            .setServerClientId(webClientId)
            .setFilterByAuthorizedAccounts(false)
            .setAutoSelectEnabled(false)
            .build();
        GetCredentialRequest request = new GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build();

        credentialManager.getCredentialAsync(
            getActivity(),
            request,
            null,
            ContextCompat.getMainExecutor(getContext()),
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse result) {
                    Credential credential = result.getCredential();
                    if (!GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                        call.reject("GOOGLE_CREDENTIAL_INVALID: Google did not return an ID-token credential.");
                        return;
                    }

                    try {
                        GoogleIdTokenCredential googleCredential = GoogleIdTokenCredential.createFrom(credential.getData());
                        JSObject payload = new JSObject();
                        payload.put("idToken", googleCredential.getIdToken());
                        payload.put("email", googleCredential.getId());
                        payload.put("displayName", googleCredential.getDisplayName());
                        call.resolve(payload);
                    } catch (Exception error) {
                        call.reject("GOOGLE_CREDENTIAL_INVALID: Unable to parse Google ID token.", error);
                    }
                }

                @Override
                public void onError(@NonNull GetCredentialException error) {
                    call.reject("GOOGLE_SIGN_IN_FAILED: " + error.getMessage(), error);
                }
            }
        );
    }

    @com.getcapacitor.PluginMethod
    public void signOut(PluginCall call) {
        credentialManager.clearCredentialStateAsync(
            new ClearCredentialStateRequest(),
            null,
            ContextCompat.getMainExecutor(getContext()),
            new CredentialManagerCallback<Void, ClearCredentialException>() {
                @Override
                public void onResult(Void result) {
                    call.resolve();
                }

                @Override
                public void onError(@NonNull ClearCredentialException error) {
                    call.reject("GOOGLE_SIGN_OUT_FAILED: " + error.getMessage(), error);
                }
            }
        );
    }
}
