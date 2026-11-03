import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const android = join(root, 'android');
const fail = (message) => { console.error(`Android build: ${message}`); process.exit(1); };
if (Number(process.versions.node.split('.')[0]) < 22) fail('Node.js 22 or newer is required by Capacitor 8.');

const java = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
const version = spawnSync(java, ['-version'], { encoding: 'utf8', timeout: 10000 });
const javaVersion = `${version.stderr || ''}\n${version.stdout || ''}`.match(/version "(?:1\.)?(\d+)/)?.[1];
if (version.error || version.status !== 0 || javaVersion !== '21') {
  fail(`Use JDK 21 and set JAVA_HOME to its installation folder. Detected: ${javaVersion || 'Java unavailable'}. Java 8 and JDK 25/26 are not the supported build setup.`);
}
const javac = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'javac.exe' : 'javac') : 'javac';
const compiler = spawnSync(javac, ['-version'], { encoding: 'utf8', timeout: 10000 });
if (compiler.status !== 0 || !`${compiler.stdout || ''}${compiler.stderr || ''}`.includes('javac 21.')) fail('A full JDK 21 is required, including javac. A Java runtime alone is insufficient.');

const localProperties = join(android, 'local.properties');
const localSdk = existsSync(localProperties)
  ? readFileSync(localProperties, 'utf8').match(/^sdk\.dir=(.*)$/m)?.[1]?.trim().replace(/\\([\\: ])/g, '$1') : null;
const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || localSdk
  || (process.platform === 'win32' && process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : null);
if (!sdk || !existsSync(join(sdk, 'platforms', 'android-36', 'android.jar'))) fail('Install Android SDK Platform 36 and Build Tools 35.0.0. Set ANDROID_HOME or android/local.properties (sdk.dir).');
if (!existsSync(join(sdk, 'build-tools', '35.0.0'))) fail('Install Android SDK Build Tools 35.0.0 with Android Studio SDK Manager.');
if (process.platform === 'win32' && /[^\x00-\x7F]/.test(root)) fail('Android Gradle Plugin on Windows requires an ASCII-only checkout path. Move or clone this repository to a path such as D:\\projects\\KA-Frontend, then run the build again.');

const env = { ...process.env, ANDROID_HOME: sdk };
console.log('Android build setup verified: JDK 21, Gradle 8.14.3, Android SDK 36.');
if (process.argv.includes('--check')) process.exit(0);
const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) process.exit(result.status || 1);
};
if (!process.env.npm_execpath) fail('Run this script through npm run android:apk or npm run android:verify.');
run(process.execPath, [process.env.npm_execpath, 'run', 'build']);
run(process.execPath, [join(root, 'node_modules', '@capacitor', 'cli', 'bin', 'capacitor'), 'sync', 'android']);
const tasks = process.argv.includes('--verify') ? [':app:assembleDebug', ':app:lintDebug', ':app:testDebugUnitTest'] : [':app:assembleDebug'];
if (process.platform === 'win32') run('cmd.exe', ['/d', '/s', '/c', 'gradlew.bat', ...tasks, '--no-daemon'], android);
else run('sh', ['./gradlew', ...tasks, '--no-daemon'], android);
