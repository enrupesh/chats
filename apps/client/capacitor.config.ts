import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "me.veilchat.app",
  appName: "VeilChat",
  webDir: "dist",

  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
  },

  server: {
    androidScheme: "https",
    cleartext: false,
  },

  plugins: {
    SplashScreen: {
      // launchAutoHide: false — we call SplashScreen.hide() manually from
      // androidSetup.ts after the AVD animation has had time to complete.
      // This prevents the Capacitor plugin from dismissing the splash too
      // early and lets the animated icon play its full ~900 ms sequence.
      launchAutoHide: false,
      launchShowDuration: 0,
      launchFadeOutDuration: 350,
      backgroundColor: "#FCF5EB",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },

    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#FCF5EB",
      overlaysWebView: false,
    },

    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    Keyboard: {
      resize: "body",
      style: "light",
      resizeOnFullScreen: true,
    },

    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#2E6F40",
      sound: "beep.wav",
    },
  },
};

export default config;
