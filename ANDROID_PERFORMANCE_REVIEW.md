# Android performance review

Reviewed on 2026-10-19. This is a source review with build checks; no Android
device or WebView frame trace was available. No measured speedup is claimed.

## Findings and changes

- `capacitor.config.ts` loads `https://ad-card.com` through `server.url`.
  The installed app therefore downloads the hosted frontend; bundling an APK
  does not currently remove frontend network loading. This deployment model
  was preserved because changing the origin affects authentication, API CORS,
  uploads, and update URLs.
- Lite mode previously depended on viewport, Android version, memory and CPU
  hints. It now applies to every native Android session, including tablets
  and devices without hardware hints. Capable web browsers keep their current
  behavior.
- This selects the existing direct routing path instead of the animated
  navigation queue (70ms leave + 150ms enter, plus paint/module loading).
  It also activates the existing reduced blur, shadow and decorative animation
  rules, suppresses the floating promotional image and automatic hero rotation,
  and omits the layout's animated ambient background. Manual hero swiping remains.
- MotionConfig now also covers public/auth routes and controls outside Layout.
  Reduced motion limits transform/layout animation; it does not remove all fades.
- The header skips unread-count polling while hidden, prevents overlapping
  requests, and checks again on returning to the foreground when due. The store
  avoids notifying subscribers when the unread count has not changed.
- Header and Layout subscribe only to the auth user instead of the entire auth
  store, reducing unrelated shell renders.

## Validation

- `npm.cmd run build`: passed. Vite reports a chunk over 500kB for the lazily
  loaded AdminCurrencies page; this is not an initial customer-route download.
- `npm.cmd run lint`: passed (`tsc --noEmit`).
- `node --test scripts/performance-mode.test.mjs`: passed, covering native
  Android, missing hardware hints, capable browsers, constrained devices,
  reduced motion, data saver, and applying/resetting the document mode.
- `git diff --check`: passed.
- APK compilation is still unverified: the previous attempt failed because
  the available Java runtime was Java 8. No new APK was produced in this review.

## Applying and measuring

Because the app loads the remote site, these frontend changes must be deployed
to `ad-card.com` to reach installed apps. Local changes and a local Vite build
alone do not update that site. No deployment was performed.

On the same phone and connection, compare a production APK with the mobile
site: cold/warm launch, opening products, searching, scrolling a long catalogue,
opening/closing purchase dialogs, and background/resume. Record network timing,
main-thread tasks and dropped frames using WebView remote debugging. Test both
light and dark themes and verify `html[data-performance-mode="lite"]` inside
the APK. The repository's `android:apk` command builds a debug APK; use a signed
release build for the final comparison.

Capacitor documents the remote `server.url` setting here:
https://capacitorjs.com/docs/config
