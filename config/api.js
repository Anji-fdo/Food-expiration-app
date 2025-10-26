// config/api.js
import { Platform } from 'react-native';

const ANDROID_EMULATOR_HOST = 'https://epuni-backend-express.vercel.app';
const IOS_SIMULATOR_HOST   = 'https://epuni-backend-express.vercel.app';
const LAN_HOST             = 'https://epuni-backend-express.vercel.app';

export const API_HOST = Platform.select({
  android: ANDROID_EMULATOR_HOST,
  ios: IOS_SIMULATOR_HOST,
  default: LAN_HOST,
});

export const BASE_URL = `${API_HOST}/api`;

const ANDROID_FLASK_HOST = 'http://10.0.2.2:5000';      // Android emulator reaches host via 10.0.2.2 [1]
const IOS_FLASK_HOST     = 'http://127.0.0.1:5000';     // iOS simulator can use localhost/127.0.0.1 [2]
const LAN_FLASK_HOST     = 'http://172.20.10.2:5000'; // Replace with your computer's LAN IPv4 for real devices

export const FLASK_HOST = Platform.select({
  android: ANDROID_FLASK_HOST,
  ios: IOS_FLASK_HOST,
  default: LAN_FLASK_HOST,
});

export const FLASK_URL = `${FLASK_HOST}`; 

//https://epuni-backend-express.vercel.app/

// import { Platform } from 'react-native';

// const ANDROID_EMULATOR_HOST = 'http://10.0.2.2:3000';   // Node/Express host from Android Emulator
// const IOS_SIMULATOR_HOST   = 'http://localhost:3000';   // Node/Express host from iOS Simulator
// const LAN_HOST             = 'http://192.168.0.100:3000'; // Replace with your computer's LAN IPv4

// export const API_HOST = Platform.select({
//   android: ANDROID_EMULATOR_HOST,
//   ios: IOS_SIMULATOR_HOST,
//   default: LAN_HOST,
// });

// export const BASE_URL = `${API_HOST}/api`;

// // Flask base (port 5000)
// const ANDROID_FLASK_HOST = 'http://10.0.2.2:5000';      // Android emulator reaches host via 10.0.2.2 [1]
// const IOS_FLASK_HOST     = 'http://127.0.0.1:5000';     // iOS simulator can use localhost/127.0.0.1 [2]
// const LAN_FLASK_HOST     = 'http://192.168.0.100:5000'; // Replace with your computer's LAN IPv4 for real devices

// export const FLASK_HOST = Platform.select({
//   android: ANDROID_FLASK_HOST,
//   ios: IOS_FLASK_HOST,
//   default: LAN_FLASK_HOST,
// });

// export const FLASK_URL = `${FLASK_HOST}`; 


