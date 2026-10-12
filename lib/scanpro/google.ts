import {Capacitor,registerPlugin} from '@capacitor/core';
declare const __SCANGAIA_GOOGLE_CLIENT_ID__:string;
export type GoogleProfile={email:string;name:string;picture?:string};
const GoogleAccount=registerPlugin<{signIn(options:{clientId:string}):Promise<GoogleProfile>;getProfile():Promise<{profile:GoogleProfile|null}>;authorizeDrive(options:{interactive:boolean}):Promise<{token:string;account:string}>;signOut():Promise<void>}>('GoogleAccount');
const clientId=typeof __SCANGAIA_GOOGLE_CLIENT_ID__==='undefined'?'':__SCANGAIA_GOOGLE_CLIENT_ID__;
export const googleReady=()=>Capacitor.isNativePlatform()&&!!clientId;
export async function googleProfile(){if(!Capacitor.isNativePlatform())return null;return (await GoogleAccount.getProfile()).profile}
export async function signInGoogle(){if(!googleReady())throw Error('El acceso con Google aún no está activado para esta versión de Android.');return GoogleAccount.signIn({clientId})}
export async function signOutGoogle(){if(Capacitor.isNativePlatform())await GoogleAccount.signOut()}

export async function driveAuthorization(interactive=false){if(!googleReady())throw Error("El acceso con Google aún no está activado.");return GoogleAccount.authorizeDrive({interactive})}
