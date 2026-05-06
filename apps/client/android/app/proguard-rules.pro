# VeilChat ProGuard / R8 rules
# ─────────────────────────────────────────────────────────────────────────────
# These rules apply to the Android wrapper shell only.  The web content
# (React app) lives inside the WebView as bundled JS and is not processed
# by R8.  Keep rules here are therefore minimal and focus on the Java/Kotlin
# layer produced by Capacitor.
# ─────────────────────────────────────────────────────────────────────────────

# Keep Capacitor bridge classes so the JS↔native bridge works at runtime.
-keep class com.getcapacitor.** { *; }
-keep class me.veilchat.app.** { *; }

# Keep the FirebaseMessaging service used by @capacitor/push-notifications.
-keep class com.google.firebase.messaging.** { *; }

# WebView JavaScript interfaces must never be renamed.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve source file names and line numbers so crash reports are readable.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Suppress notes about missing classes in third-party dependencies.
-dontnote com.getcapacitor.**
-dontnote com.google.firebase.**

# Keep annotations used by Capacitor.
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
