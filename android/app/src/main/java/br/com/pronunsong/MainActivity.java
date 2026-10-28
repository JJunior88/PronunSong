package br.com.pronunsong;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.*;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.util.Arrays;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String ORIGIN = "https://appassets.androidplatform.net";
    private WebView web;
    private PermissionRequest pending;
    private TextToSpeech speech;
    private boolean speechReady;
    private ValueCallback<Uri[]> fileCallback;
    private final Set<String> selectedFiles = ConcurrentHashMap.newKeySet();

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        speech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int language = speech.setLanguage(Locale.US);
                speechReady = language != TextToSpeech.LANG_MISSING_DATA && language != TextToSpeech.LANG_NOT_SUPPORTED;
            }
        });
        web = new WebView(this);
        web.setPadding(0, getStatusBarHeight(), 0, 0);
        web.setBackgroundColor(0xff101024);
        getWindow().setStatusBarColor(0xff101024);
        getWindow().setNavigationBarColor(0xff101024);
        setContentView(web);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(true);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if ("content".equals(request.getUrl().getScheme()) && selectedFiles.contains(request.getUrl().toString())) return null;
                WebResourceResponse local = loader.shouldInterceptRequest(request.getUrl());
                if (local != null) return local;
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden", java.util.Collections.emptyMap(), new java.io.ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !("https".equals(request.getUrl().getScheme()) && "appassets.androidplatform.net".equals(request.getUrl().getHost()));
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                // Some file providers do not label LRC files as text/plain.
                boolean audio = Arrays.stream(params.getAcceptTypes()).anyMatch(t -> t.contains("audio") || t.contains("mp3"));
                intent.setType(audio ? "audio/*" : "*/*");
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try { startActivityForResult(intent, 8); }
                catch (android.content.ActivityNotFoundException error) {
                    fileCallback.onReceiveValue(null); fileCallback = null;
                    Toast.makeText(MainActivity.this, "Nenhum seletor de arquivos disponível.", Toast.LENGTH_LONG).show();
                }
                return true;
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (!ORIGIN.equals(request.getOrigin().toString().replaceAll("/$", "")) ||
                        !Arrays.asList(request.getResources()).contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE) || pending != null) { request.deny(); return; }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    else { pending = request; requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 7); }
                });
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) { if (pending == request) pending = null; }
        });
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface public void stopSpeech() { runOnUiThread(() -> speech.stop()); }
            @JavascriptInterface public void speak(String text, double rate) {
                runOnUiThread(() -> {
                    if (!speechReady) { Toast.makeText(MainActivity.this, "Voz em inglês indisponível. Instale uma voz em inglês nas configurações de texto para fala do Android.", Toast.LENGTH_LONG).show(); return; }
                    speech.setSpeechRate((float)Math.max(0.5, Math.min(1.2, rate)));
                    speech.speak(text.substring(0, Math.min(text.length(), 1000)), TextToSpeech.QUEUE_FLUSH, null, "phrase");
                });
            }
        }, "PronunSongAndroid");
        web.loadUrl(ORIGIN + "/assets/index.html");
    }
    private int getStatusBarHeight() {
        int resource = getResources().getIdentifier("status_bar_height", "dimen", "android");
        return resource > 0 ? getResources().getDimensionPixelSize(resource) : 0;
    }
    @Override protected void onActivityResult(int code, int result, Intent data) {
        super.onActivityResult(code, result, data);
        if (code == 8 && fileCallback != null) {
            Uri uri = result == RESULT_OK && data != null ? data.getData() : null;
            if (uri != null && "content".equals(uri.getScheme())) {
                selectedFiles.add(uri.toString()); fileCallback.onReceiveValue(new Uri[]{uri});
            } else fileCallback.onReceiveValue(null);
            fileCallback = null;
        }
    }
    @Override public void onRequestPermissionsResult(int code, String[] names, int[] results) {
        super.onRequestPermissionsResult(code, names, results);
        if (code == 7 && pending != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) pending.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            else pending.deny(); pending = null;
        }
    }
    @Override protected void onPause() {
        super.onPause(); speech.stop();
        web.evaluateJavascript("document.getElementById('record').dataset.pause='true'; window.dispatchEvent(new Event('pronunsong-pause'));", null);
    }
    @Override protected void onDestroy() {
        if (pending != null) { pending.deny(); pending = null; }
        if (fileCallback != null) { fileCallback.onReceiveValue(null); fileCallback = null; }
        web.destroy(); speech.shutdown(); super.onDestroy();
    }
}
