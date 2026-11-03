# Android build setup

This Capacitor 8 project uses Android Gradle Plugin 8.13.0, Gradle 8.14.3,
and JDK 21. Keep these versions together. Do not upgrade only the Gradle
wrapper to 9.x: the current build still uses Gradle 8 APIs.

The wrapper distribution is pinned by its official SHA-256 checksum. Its
network timeout is 60 seconds to allow slower connections. The wrapper JAR
already matches the official Gradle 8.14.3 wrapper checksum.

## Local setup

1. Install a full JDK 21 and set `JAVA_HOME` to that folder. Java 8 on PATH
   and the JDK 25/26 bundled with some editor extensions are not this build's
   supported configuration. Avoid machine-specific Java paths in Gradle files.
2. Install Android SDK Platform 36 and Build Tools 35.0.0 using Android Studio
   SDK Manager. Set `ANDROID_HOME` to the SDK directory, or put `sdk.dir` in
   the ignored `android/local.properties` file.
3. On Windows, use an ASCII-only checkout path, for example
   `D:\projects\KA-Frontend`. An Arabic/non-ASCII path can prevent Java or the
   Android Gradle plugin from loading files. Do not disable Gradle's path
   validation to hide this problem.
4. Use Node.js 22 or newer and install dependencies with `npm ci`.

```sh
npm run android:check
npm run android:apk
```

`android:check` checks the local toolchain without building. `android:apk`
checks the toolchain, builds fresh web assets, synchronizes Capacitor, and
assembles the debug APK. A failed step stops the build.

For compilation, Android lint, and local native unit tests together:

```sh
npm run android:verify
```

Debug APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.
This command does not publish a release or upload an APK.

## Verified checks

The debug APK, `:app:lintDebug`, and `:app:testDebugUnitTest` passed on Windows
using the JDK 21 / Gradle 8.14.3 / SDK 36 toolchain in an ASCII-only test
checkout. The web production build also passed. Camera and autofocus hardware
are explicitly optional so the camera permission does not exclude devices
without that hardware or fail the compatibility lint check.

These build checks do not replace testing sign-in, push notifications, camera,
and other app behavior on real Android devices.

Firebase push needs your private `android/app/google-services.json` file.
Google sign-in also needs `GOOGLE_WEB_CLIENT_ID`. Keep private configuration
and signing keys outside Git; a successful build alone does not verify these
services on a device.

Official references:

- [Capacitor 8 migration and Gradle 8.14.3](https://capacitorjs.com/docs/updating/8-0)
- [AGP 8.13 compatibility](https://developer.android.com/build/releases/agp-8-13-0-release-notes)
