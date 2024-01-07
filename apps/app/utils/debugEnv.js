// debugEnv.js
export const debugEnv = () => {
  console.log('Environment Variables:', process.env.REACT_APP_ENV);
  console.log('Environment Variables:', process.env.NETWORKS);
  console.log('Environment NEXT_PUBLIC Variables:', process.env.NEXT_PUBLIC_REACT_APP_ENV);
  console.log('Environment NEXT_PUBLIC Variables:', process.env.NEXT_PUBLIC_NETWORKS);
};
