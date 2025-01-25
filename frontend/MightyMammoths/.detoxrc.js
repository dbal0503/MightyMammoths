module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'path/to/your/expo-built-app/MightyMammoths.app',
      build: 'expo prebuild && expo run:ios --no-wait',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'path/to/your/expo-built-app/MightyMammoths.apk',
      build: 'expo prebuild && expo run:android --variant release',
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_3a_API_30_x86'
      }
    }
  },
  configurations: {
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
};
